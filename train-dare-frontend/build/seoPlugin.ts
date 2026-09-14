import type { Plugin } from 'vite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { articleSeo, pages, pageSeo } from '../src/seo/pages';
import type { PageSeo } from '../src/seo/pages';
import type { BlogPost } from '../src/types/blog';
import { canonicalUrl, escapeHtml, renderMetadata, siteOrigin } from '../src/seo/metadata';

/** Emit route-specific HTML heads so sharing crawlers do not need JavaScript. */
export function seoPlugin(env: Record<string, string>): Plugin {
  const origin = siteOrigin(env.VITE_SITE_URL || env.URL);
  const api = env.SEO_API_URL?.replace(/\/+$/, '');
  if (origin && api && origin === new URL(api).origin) {
    throw new Error('The frontend SEO origin must differ from the backend API origin.');
  }
  let outputDirectory = '';
  return {
    name: 'train-dare-seo',
    enforce: 'post',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = new URL(req.url || '/', 'http://localhost').pathname.replace(/\/+$/, '');
        if (!/^\/[a-z0-9/-]+$/.test(path)) return next();
        const target = path.startsWith('/inscription/') ? '/inscription/index.html' : `${path}/index.html`;
        req.url = existsSync(resolve(outputDirectory, `.${target}`)) ? target : '/spa.html';
        next();
      });
    },
    async generateBundle(_options, bundle) {
      const entry = bundle['index.html'];
      if (!entry || entry.type !== 'asset') throw new Error('SEO build: index.html is missing.');
      const template = String(entry.source);
      const html = (page: PageSeo) => template.replace(/<title>[\s\S]*?<\/title>/, renderMetadata(page, origin));
      const routes: PageSeo[] = Object.entries(pages).map(([path, page]) => ({ ...page, path }));

      if (!origin) this.warn('VITE_SITE_URL is not configured: absolute canonical and social URLs are omitted from static HTML. Set the official origin before publishing.');
      if (api) {
        let posts: unknown;
        try {
          const response = await fetch(`${api}/blogs/published`, {
            signal: AbortSignal.timeout(30000),
            headers: { 'Cache-Control': 'no-cache, no-store' },
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          posts = await response.json();
        } catch (error) {
          // Rollup annotates errors with a writable code; DOMException.code is read-only.
          const detail = error instanceof Error || error instanceof DOMException
            ? (error.name === 'Error' ? error.message : error.name) : 'network error';
          throw new Error(`SEO blog snapshot failed: ${detail}`);
        }
        if (!Array.isArray(posts)) throw new Error('SEO blog snapshot must be an array.');
        for (const post of posts as BlogPost[]) {
          if (post.status !== 'published') continue;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) ||
              typeof post.title !== 'string' || typeof post.excerpt !== 'string') {
            throw new Error('SEO blog snapshot contains an invalid published article.');
          }
          if (post.slug === 'admin') throw new Error('SEO blog slug conflicts with the administration route.');
          routes.push(articleSeo(post));
        }
      } else {
        this.warn('SEO_API_URL is not configured: article metadata is rendered by React only. Configure the public API and rebuild for social sharing HTML.');
      }

      // Unknown dynamic routes must not inherit the home page canonical.
      this.emitFile({ type: 'asset', fileName: 'spa.html', source: template });
      for (const page of routes) {
        if (page.path === '/') entry.source = html(page);
        else this.emitFile({ type: 'asset', fileName: `${page.path!.slice(1)}/index.html`, source: html(page) });
      }
      this.emitFile({ type: 'asset', fileName: '404.html', source: html(pageSeo('/404')) });
      // The bare campaign URL displays the formation campaign in React.
      this.emitFile({ type: 'asset', fileName: 'landing/index.html', source: html(pageSeo('/landing/formation')) });

      if (origin) {
        const entries = routes.filter((page) => !page.noindex)
          .map((page) => `<url><loc>${escapeHtml(canonicalUrl(page.path || '/', origin))}</loc></url>`);
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source:
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>` });
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source:
        `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}` });
      // Keep previews out of indexes even after React replaces the initial meta tags.
      if (env.NETLIFY === 'true' && ['deploy-preview', 'branch-deploy', 'dev'].includes(env.CONTEXT)) {
        this.emitFile({ type: 'asset', fileName: '_headers', source: '/*\n  X-Robots-Tag: noindex, nofollow\n' });
      }
    },
  };
}
