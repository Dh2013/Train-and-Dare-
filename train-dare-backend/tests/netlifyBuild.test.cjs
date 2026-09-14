const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { requestNetlifyBuild } = require('../dist/services/netlifyBuild');

const originalHook = process.env.NETLIFY_BUILD_HOOK;
const fakeHook = 'https://netlify-hook.invalid/test-only';
let logs;

beforeEach((t) => {
  delete process.env.NETLIFY_BUILD_HOOK;
  logs = [];
  t.mock.method(console, 'info', (...args) => logs.push(args.join(' ')));
  t.mock.method(console, 'warn', (...args) => logs.push(args.join(' ')));
});
afterEach(() => {
  if (originalHook === undefined) delete process.env.NETLIFY_BUILD_HOOK;
  else process.env.NETLIFY_BUILD_HOOK = originalHook;
});

test('absent or blank hook causes no HTTP request and no log', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected network'); });
  await requestNetlifyBuild();
  process.env.NETLIFY_BUILD_HOOK = '  ';
  await requestNetlifyBuild();
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.deepEqual(logs, []);
});

test('configured hook receives POST with a timeout and redirects disabled', async (t) => {
  process.env.NETLIFY_BUILD_HOOK = fakeHook;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(String(url), fakeHook);
    assert.equal(options.method, 'POST');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.signal.aborted, false);
    assert.equal(options.body, undefined);
    return new Response(null, { status: 202 });
  });
  await requestNetlifyBuild();
  assert.deepEqual(logs, ['[Netlify] Build requested successfully']);
});

for (const failure of ['http', 'network', 'invalid-url']) {
  test(`${failure} failure is contained and does not leak the hook or error body`, async (t) => {
    process.env.NETLIFY_BUILD_HOOK = failure === 'invalid-url' ? 'invalid-secret-value' : fakeHook;
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
      if (failure === 'network') throw new Error(`Private URL: ${fakeHook}`);
      return new Response(`Sensitive response ${fakeHook}`, { status: 503 });
    });
    await assert.doesNotReject(requestNetlifyBuild());
    assert.deepEqual(logs, ['[Netlify] Unable to request rebuild']);
    if (failure === 'invalid-url') assert.equal(fetchMock.mock.callCount(), 0);
  });
}

test('a hung fetch is aborted after the five-second timeout', { timeout: 8000 }, async (t) => {
  process.env.NETLIFY_BUILD_HOOK = fakeHook;
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  // AbortSignal.timeout uses an unref timer; keep this isolated test alive.
  const keepAlive = setInterval(() => {}, 1000);
  try {
    await assert.doesNotReject(requestNetlifyBuild());
    assert.deepEqual(logs, ['[Netlify] Unable to request rebuild']);
  } finally {
    clearInterval(keepAlive);
  }
});
