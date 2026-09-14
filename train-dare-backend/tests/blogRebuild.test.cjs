const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const jwt = require('jsonwebtoken');

// Router paths are resolved from cwd. Isolate all writes from real blog data.
const initialCwd = process.cwd();
const tempRoot = fs.realpathSync(os.tmpdir());
const directory = fs.mkdtempSync(path.join(tempRoot, 'train-dare-blog-tests-'));
const dataDirectory = path.join(directory, 'src', 'data');
fs.mkdirSync(dataDirectory, { recursive: true });
process.chdir(directory);
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';
process.env.JWT_SECRET = 'integration-test-only-secret';
process.env.NETLIFY_BUILD_HOOK = 'https://netlify-hook.invalid/test-only';
const fakeHook = process.env.NETLIFY_BUILD_HOOK;
const router = require('../dist/routes/blogs').default;
const token = jwt.sign({ sub: 'admin', role: 'admin' }, process.env.JWT_SECRET);
const nativeFetch = globalThis.fetch;
const blogsFile = path.join(dataDirectory, 'blogs.json');
const readPosts = () => JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
const originalInfo = console.info;
const originalWarn = console.warn;
let server, origin, calls, hookHandler, logs;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/blogs', router);
  app.use((_error, _req, res, _next) => res.status(500).json({ error: 'Save failed' }));
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  globalThis.fetch = (url, options) => {
    if (String(url) === fakeHook) {
      calls.push({ method: options.method, saved: readPosts() });
      return hookHandler(url, options);
    }
    assert.ok(String(url).startsWith(`${origin}/`), 'Only the local API may receive real test traffic');
    return nativeFetch(url, options);
  };
  console.info = (...args) => logs.push(args.join(' '));
  console.warn = (...args) => logs.push(args.join(' '));
});

beforeEach(() => {
  calls = [];
  logs = [];
  process.env.NETLIFY_BUILD_HOOK = fakeHook;
  hookHandler = async () => new Response(null, { status: 200 });
  fs.writeFileSync(blogsFile, '[]');
  fs.writeFileSync(path.join(dataDirectory, 'blog-categories.json'), '[]');
});

after(async () => {
  globalThis.fetch = nativeFetch;
  console.info = originalInfo;
  console.warn = originalWarn;
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  process.chdir(initialCwd);
  const resolved = fs.realpathSync(directory);
  assert.equal(path.dirname(resolved), tempRoot);
  assert.ok(path.basename(resolved).startsWith('train-dare-blog-tests-'));
  fs.rmSync(resolved, { recursive: true });
});

async function request(method, route, body, authorized = true) {
  const response = await fetch(`${origin}/api/blogs${route}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(authorized ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(2000),
  });
  const text = await response.text();
  assert.ok(!text.includes(fakeHook), 'API response must never expose the hook');
  return { status: response.status, body: text ? JSON.parse(text) : undefined };
}

async function create(status = 'draft', extra = {}) {
  const result = await request('POST', '/', { title: 'Article de test', content: '<h2>Contenu</h2><p>Texte utile.</p>', status, ...extra });
  assert.equal(result.status, 201);
  return result.body;
}

test('draft creation, edit and deletion do not rebuild', async () => {
  const post = await create();
  assert.equal((await request('PUT', `/${post.id}`, { title: 'Brouillon modifie' })).status, 200);
  assert.equal((await request('DELETE', `/${post.id}`)).status, 204);
  assert.equal(calls.length, 0);
});

test('missing hook does not prevent saving a public article', async () => {
  delete process.env.NETLIFY_BUILD_HOOK;
  const post = await create('published');
  assert.equal(readPosts()[0].id, post.id);
  assert.equal(calls.length, 0);
});

test('a new public article is persisted before a single POST is sent', async () => {
  const post = await create('published');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].saved[0].id, post.id);
  assert.equal(calls[0].saved[0].status, 'published');
});

test('PUT publishes, edits a public article (including slug), and unpublishes', async () => {
  const post = await create();
  await request('PUT', `/${post.id}`, { status: 'published' });
  assert.equal(calls.length, 1);
  await request('PUT', `/${post.id}`, { title: 'Titre public', slug: 'nouvelle-url', metaDescription: 'Description SEO' });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].saved[0].slug, 'nouvelle-url');
  await request('PUT', `/${post.id}`, { status: 'draft' });
  assert.equal(calls.length, 3);
  await request('PUT', `/${post.id}`, { title: 'Brouillon prive' });
  assert.equal(calls.length, 3);
});

test('PATCH publish and unpublish rebuild, repeated unpublish on draft does not', async () => {
  const post = await create();
  assert.equal((await request('PATCH', `/${post.id}/publish`)).status, 200);
  assert.equal(calls.length, 1);
  assert.equal((await request('PATCH', `/${post.id}/unpublish`)).status, 200);
  assert.equal(calls.length, 2);
  await request('PATCH', `/${post.id}/unpublish`);
  assert.equal(calls.length, 2);
});

test('deletion of a published article rebuilds only after removal', async () => {
  const post = await create('published');
  assert.equal((await request('DELETE', `/${post.id}`)).status, 204);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].saved, []);
});

for (const failure of ['http', 'network']) {
  test(`a ${failure} hook failure preserves the article and successful API response`, async () => {
    hookHandler = async () => {
      if (failure === 'network') throw new Error(`Do not log ${fakeHook}`);
      return new Response(fakeHook, { status: 503 });
    };
    const post = await create('published');
    assert.equal(readPosts()[0].id, post.id);
    assert.equal((await request('GET', `/${post.slug}`, undefined, false)).status, 200);
    assert.deepEqual(logs, ['[Netlify] Unable to request rebuild']);
  });
}

test('the HTTP response does not wait for a pending Netlify request', async () => {
  let release;
  hookHandler = () => new Promise((resolve) => { release = resolve; });
  try {
    const post = await create('published');
    assert.equal(readPosts()[0].id, post.id);
    assert.equal(calls.length, 1);
    assert.deepEqual(logs, []);
  } finally {
    release?.(new Response(null, { status: 200 }));
    await new Promise(setImmediate);
  }
});

test('invalid, missing and unauthorized mutations never request a build', async () => {
  assert.equal((await request('POST', '/', { status: 'published' })).status, 400);
  assert.equal((await request('POST', '/', { status: 'published' }, false)).status, 401);
  assert.equal((await request('PUT', '/missing', { status: 'published' })).status, 404);
  assert.equal((await request('DELETE', '/missing')).status, 404);
  assert.equal(calls.length, 0);
});

test('a failed filesystem save does not request a build', async (t) => {
  const post = await create('published');
  const originalWrite = fs.writeFileSync;
  t.mock.method(fs, 'writeFileSync', (file, ...args) => {
    if (file === blogsFile) throw new Error('Simulated storage failure');
    return originalWrite(file, ...args);
  });
  assert.equal((await request('PUT', `/${post.id}`, { title: 'Not saved' })).status, 500);
  assert.equal(readPosts()[0].title, post.title);
  assert.equal(calls.length, 1);
});

test('future scheduled posts stay private; promotion on read rebuilds once', async () => {
  const post = await create('scheduled', { scheduledFor: new Date(Date.now() + 86400000).toISOString() });
  await request('PUT', `/${post.id}`, { title: 'Scheduled edit' });
  assert.equal(calls.length, 0);
  const records = readPosts();
  records[0].scheduledFor = new Date(Date.now() - 10000).toISOString();
  fs.writeFileSync(blogsFile, JSON.stringify(records));
  const result = await request('GET', '/published', undefined, false);
  assert.equal(result.body[0].status, 'published');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].saved[0].status, 'published');
  await request('GET', '/published', undefined, false);
  assert.equal(calls.length, 1);
});

test('moving a public article to a future schedule removes public content and rebuilds', async () => {
  const post = await create('published');
  await request('PUT', `/${post.id}`, { status: 'scheduled', scheduledFor: new Date(Date.now() + 86400000).toISOString() });
  assert.equal(calls.length, 2);
  assert.equal((await request('GET', '/published', undefined, false)).body.length, 0);
});

test('renaming a category used by public posts preserves mappings and rebuilds', async () => {
  const category = await request('POST', '/categories', { name: 'Custom category' });
  const post = await create('published', { category: category.body.slug });
  const result = await request('PUT', `/categories/${category.body.slug}`, { name: 'New category', slug: 'new-category' });
  assert.equal(result.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(readPosts().find((item) => item.id === post.id).category, 'new-category');
});

test('a signed token for a missing database account cannot read a draft', async () => {
  const post = await create('draft');
  const revoked = jwt.sign({ sub: '507f1f77bcf86cd799439011', role: 'admin' }, process.env.JWT_SECRET);
  const response = await fetch(origin + '/api/blogs/' + post.id, { headers: { Authorization: 'Bearer ' + revoked } });
  assert.equal(response.status, 404);
  assert.equal(calls.length, 0);
});
