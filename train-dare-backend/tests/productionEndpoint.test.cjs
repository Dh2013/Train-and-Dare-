const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

const revision = '1234567890abcdef1234567890abcdef12345678';
const tempRoot = fs.realpathSync(os.tmpdir());
const directory = fs.mkdtempSync(path.join(tempRoot, 'train-dare-production-test-'));
let child, origin;

before(async () => {
  const dataDirectory = path.join(directory, 'src', 'data');
  fs.mkdirSync(dataDirectory, { recursive: true });
  const posts = ['published', 'draft'].map((status) => ({
    id: status, slug: status, title: `Article ${status}`, status,
    content: '<p>Contenu de test</p>', tags: [],
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    publishedAt: status === 'published' ? '2026-01-01T00:00:00.000Z' : null,
  }));
  fs.writeFileSync(path.join(dataDirectory, 'blogs.json'), JSON.stringify(posts));
  fs.writeFileSync(path.join(dataDirectory, 'blog-categories.json'), '[]');
  // Run the real compiled entry point, including its actual router mounts and bootstrap.
  // Observe the ephemeral port without changing application routing or storage code.
  const entry = path.resolve(__dirname, '../dist/index.js');
  const childEnv = { ...process.env };
  // The server is not a node:test worker; keep its IPC channel for readiness only.
  delete childEnv.NODE_TEST_CONTEXT;
  child = spawn(process.execPath, ['-e', `
    const http = require('node:http');
    const listen = http.Server.prototype.listen;
    http.Server.prototype.listen = function (...args) {
      this.once('listening', () => process.send({ port: this.address().port }));
      return listen.apply(this, args);
    };
    require(${JSON.stringify(entry)});
  `], {
    cwd: directory,
    env: {
      ...childEnv, NODE_ENV: 'production', PORT: '0', MONGODB_URI: '',
      MONGODB_REQUIRED: 'false', NETLIFY_BUILD_HOOK: '',
      JWT_SECRET: 'endpoint-test-only-secret-at-least-32-characters', ADMIN_USERNAME: 'test-admin',
      ADMIN_PASSWORD: 'endpoint-test-only-password', RENDER_GIT_COMMIT: revision,
    },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    windowsHide: true,
  });
  let stderr = '';
  let stdout = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const address = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Compiled backend startup timed out; stdout=${stdout}; stderr=${stderr}`)), 15000);
    child.once('message', (message) => { clearTimeout(timer); resolve(message); });
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Compiled backend exited with ${code}: ${stderr}`));
    });
  });
  origin = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
  const resolved = fs.realpathSync(directory);
  assert.equal(path.dirname(resolved), tempRoot);
  assert.ok(path.basename(resolved).startsWith('train-dare-production-test-'));
  fs.rmSync(resolved, { recursive: true });
});

test('compiled server GET /api/blogs/published returns public JSON without authentication', async () => {
  const response = await fetch(`${origin}/api/blogs/published`, { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const posts = await response.json();
  assert.ok(Array.isArray(posts), 'published must resolve to the list route, not /:id');
  assert.deepEqual(posts.map((post) => post.id), ['published']);
  assert.ok(posts.every((post) => post.status === 'published'));
  const missing = await fetch(`${origin}/api/blogs/nonexistent-article`);
  assert.equal(missing.status, 404);
  assert.equal(typeof (await missing.json()).error, 'string');
});

test('existing /api/health identifies the compiled Render revision', async () => {
  const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200);
  const health = await response.json();
  assert.equal(health.status, 'ok');
  assert.equal(health.revision, revision);
});

test('production JSON login accepts explicit credentials and refuses defaults', async () => {
  const login = (username, password) => fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  assert.equal((await login('admin', 'admin')).status, 401);
  const response = await login('test-admin', 'endpoint-test-only-password');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(typeof body.token, 'string');
  const me = await fetch(origin + '/api/auth/me', { headers: { Authorization: 'Bearer ' + body.token } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).user.role, 'admin');
});
