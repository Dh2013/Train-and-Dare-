import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

try {
  assert.ok(process.argv[2], 'Usage: npm run verify:deployment -- https://your-site.netlify.app');
  const site = new URL(process.argv[2]);
  const canonicalOrigin = new URL(process.env.VITE_SITE_URL || site.origin).origin;
  const paths = ['/', '/programmes/education', '/programmes/formation', '/programmes/parent-ado', '/programmes/enseignants', '/adult-plus-info', '/blog', '/inscription'];
  for (const path of paths) {
    const response = await fetch(new URL(path, site), { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
    const document = new JSDOM(await response.text()).window.document;
    assert.equal(document.documentElement.lang, 'fr', path);
    assert.equal(document.querySelectorAll('meta[name="description"]').length, 1, path);
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, path);
    assert.equal(document.querySelector('link[rel="canonical"]').href, canonicalOrigin + path, path);
    assert.ok(document.querySelector('meta[property="og:image"]')?.content, path);
    assert.ok(document.querySelector('meta[name="twitter:card"]')?.content, path);
    console.log(`${path}: HTTP 200 and SEO metadata verified`);
  }
  for (const path of ['/robots.txt', '/sitemap.xml', '/social-cover.jpg', '/api/health', '/api/programs', '/api/blogs/published']) {
    const response = await fetch(new URL(path, site), { signal: AbortSignal.timeout(45000) });
    assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
    if (path.startsWith('/api/')) {
      assert.match(response.headers.get('content-type') || '', /application\/json/i, path);
      const data = await response.json();
      if (path === '/api/health') assert.equal(data.status, 'ok');
      else assert.ok(Array.isArray(data), path);
    } else if (path === '/social-cover.jpg') {
      assert.match(response.headers.get('content-type') || '', /image\/jpeg/i, path);
    } else if (path === '/robots.txt') {
      const text = await response.text();
      assert.match(text, /User-agent:\s*\*/i);
      assert.ok(text.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
    } else if (path === '/sitemap.xml') {
      const document = new JSDOM(await response.text(), { contentType: 'text/xml' }).window.document;
      assert.equal(document.documentElement.localName, 'urlset');
      const locations = [...document.querySelectorAll('loc')].map((element) => element.textContent);
      assert.ok(locations.includes(`${canonicalOrigin}/`));
      assert.ok(locations.includes(`${canonicalOrigin}/blog`));
      assert.ok(!locations.some((url) => /\/(administrateur|editeur|404)$|\/blog\/admin$/.test(url)));
    }
    console.log(`${path}: HTTP 200`);
  }
  console.log('Deployment checks passed. No forms were submitted.');
} catch (error) {
  console.error(`Deployment verification failed: ${error.message}`);
  process.exitCode = 1;
}
