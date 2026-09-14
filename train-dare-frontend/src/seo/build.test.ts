import { afterEach, describe, expect, it, vi } from 'vitest';
import { seoPlugin } from '../../build/seoPlugin';
import { posts } from '../component/BlogData';

afterEach(() => vi.unstubAllGlobals());

async function generate(overrides: Record<string, string> = {}) {
  const emitted = new Map<string, string>();
  const plugin = seoPlugin({
    VITE_SITE_URL: 'https://academy.example',
    SEO_API_URL: 'https://train-and-dare.onrender.com/api',
    ...overrides,
  });
  const hook = plugin.generateBundle;
  if (typeof hook !== 'function') throw new Error('Missing generation hook');
  await Reflect.apply(hook, {
    emitFile: (asset: { fileName: string; source: string }) => emitted.set(asset.fileName, asset.source),
    warn: vi.fn(),
  }, [{}, { 'index.html': { type: 'asset', source: '<html lang="fr"><head><title>App</title></head><body><div id="root"></div></body></html>' } }, false]);
  return emitted;
}

describe('SEO build from the public Express API', () => {
  it('uses Netlify main URL before an explicit frontend origin is configured', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{ ...posts[0], status: 'published' }]))));
    const files = await generate({ VITE_SITE_URL: '', URL: 'https://academy.example' });
    const html = files.get(`blog/${posts[0].slug}/index.html`)!;
    expect(html).toContain(`href="https://academy.example/blog/${posts[0].slug}"`);
    expect(html).toContain('https://academy.example/social-cover.jpg');
    expect(files.get('sitemap.xml')).toContain(`https://academy.example/blog/${posts[0].slug}`);
    expect(files.get('robots.txt')).toContain('Sitemap: https://academy.example/sitemap.xml');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!)).toMatchObject({
      url: `https://academy.example/blog/${posts[0].slug}`,
      publisher: { url: 'https://academy.example' },
    });
  });

  it('never infers a frontend canonical from the API when both frontend origins are absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{ ...posts[0], status: 'published' }]))));
    const files = await generate({ VITE_SITE_URL: '', URL: '' });
    expect(files.get(`blog/${posts[0].slug}/index.html`)).not.toContain('rel="canonical"');
    expect(files.has('sitemap.xml')).toBe(false);
    expect(files.get('robots.txt')).not.toContain('Sitemap:');
  });

  it('rejects the backend origin even if supplied as the frontend origin', () => {
    for (const key of ['VITE_SITE_URL', 'URL']) {
      expect(() => seoPlugin({ [key]: 'https://train-and-dare.onrender.com', SEO_API_URL: 'https://train-and-dare.onrender.com/api' })).toThrow('must differ');
    }
  });

  it('fetches the specified public endpoint without cache and emits complete article metadata', async () => {
    const article = { ...posts[0], metaTitle: 'Titre SEO modifié', metaDescription: 'Description mise à jour', status: 'published' };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([article, { ...article, slug: 'private-draft', status: 'draft' }])));
    vi.stubGlobal('fetch', fetchMock);
    const files = await generate();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://train-and-dare.onrender.com/api/blogs/published',
      expect.objectContaining({ headers: { 'Cache-Control': 'no-cache, no-store' }, signal: expect.any(AbortSignal) })
    );
    const html = files.get(`blog/${article.slug}/index.html`)!;
    const document = new DOMParser().parseFromString(html, 'text/html');
    expect(document.title).toContain(article.metaTitle);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(article.metaDescription);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`https://academy.example/blog/${article.slug}`);
    for (const property of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) {
      expect(document.querySelector(`meta[property="${property}"]`)?.getAttribute('content')).toBeTruthy();
    }
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      expect(document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')).toBeTruthy();
    }
    expect(files.has('blog/private-draft/index.html')).toBe(false);
    expect(files.get('sitemap.xml')).not.toContain('private-draft');
    expect(html).not.toContain('NETLIFY_BUILD_HOOK');
  });

  it('does not emit a removed or unpublished article in the next snapshot', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ ...posts[0], status: 'published' }])))
      .mockResolvedValueOnce(new Response('[]'));
    vi.stubGlobal('fetch', fetchMock);
    expect((await generate()).has(`blog/${posts[0].slug}/index.html`)).toBe(true);
    const nextFiles = await generate();
    expect(nextFiles.has(`blog/${posts[0].slug}/index.html`)).toBe(false);
    expect(nextFiles.get('sitemap.xml')).not.toContain(`/blog/${posts[0].slug}`);
  });

  it('fails visibly when Render returns an error instead of publishing an incomplete snapshot', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unavailable', { status: 404 })));
    await expect(generate()).rejects.toThrow('SEO blog snapshot failed: HTTP 404');
  });

  it('reports native network timeouts as an Error that Rollup can annotate', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError')));
    const error = await generate().catch((failure: unknown) => failure);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(DOMException);
    expect((error as Error).message).toBe('SEO blog snapshot failed: TimeoutError');
    expect(() => Object.assign(error as Error, { code: 'PLUGIN_ERROR' })).not.toThrow();
  });
});
