import assert from 'node:assert/strict';
import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), '');

function publicUrl(value, name) {
  assert.ok(value, `${name} is required before deployment.`);
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', `${name} must use HTTPS.`);
  assert.ok(!url.username && !url.password && !url.search && !url.hash, `${name} must not contain credentials, query parameters or a fragment.`);
  assert.ok(!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), `${name} must be publicly accessible.`);
  return url;
}

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  assert.equal(response.status, 200, `${url.pathname}: expected HTTP 200, received ${response.status}.`);
  assert.match(response.headers.get('content-type') || '', /application\/json/i, `${url.pathname}: JSON expected.`);
  return response.json();
}

try {
  const site = publicUrl(env.VITE_SITE_URL || env.URL, 'VITE_SITE_URL or Netlify URL');
  assert.equal(site.pathname, '/', 'The public site URL must be an origin without a path.');
  const api = publicUrl(env.SEO_API_URL, 'SEO_API_URL');
  assert.notEqual(site.origin, api.origin, 'The frontend SEO origin must differ from the backend API origin.');
  assert.equal(env.VITE_API_URL, '/api', 'Netlify must use VITE_API_URL=/api with its API proxy.');
  // Ensure the SEO snapshot and the browser use the same backend.
  const { readFile } = await import('node:fs/promises');
  const config = await readFile(new URL('../../netlify.toml', import.meta.url), 'utf8');
  const proxyTarget = config.match(/to\s*=\s*"(https:\/\/[^"\s]+)\/:splat"/)?.[1];
  assert.equal(api.href.replace(/\/+$/, ''), proxyTarget, 'SEO_API_URL and the /api proxy in netlify.toml must target the same backend.');
  const base = api.href.replace(/\/+$/, '');
  const health = await getJson(new URL(`${base}/health`));
  assert.equal(health.status, 'ok', 'Backend health check failed.');
  for (const endpoint of ['programs', 'blogs/published']) {
    const data = await getJson(new URL(`${base}/${endpoint}`));
    assert.ok(Array.isArray(data), `${endpoint}: an array is required.`);
    console.log(`${endpoint}: HTTP 200, ${data.length} records`);
  }
  console.log('Production prerequisites passed. Backend and canonical origin are configured.');
} catch (error) {
  console.error(`Production check failed: ${error.message}`);
  process.exitCode = 1;
}
