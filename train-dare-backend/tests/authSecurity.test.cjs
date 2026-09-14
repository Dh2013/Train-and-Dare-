const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const express = require('express');
const jwt = require('jsonwebtoken');
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'auth-tests-only-secret-with-32-characters';
process.env.MONGODB_URI = 'mongodb://127.0.0.1/test-only-no-connection';
process.env.ADMIN_USERNAME = 'test-admin';
process.env.ADMIN_PASSWORD = 'test-only-password';
const connection = require('../dist/database/connection');
const { AdminUserModel } = require('../dist/database/models');
const { requireAdmin } = require('../dist/middleware/auth');
const authRouter = require('../dist/routes/auth').default;
const { createLoginRateLimit } = require('../dist/middleware/loginRateLimit');
let ready = true;
let account;
connection.isDatabaseReady = () => ready;
AdminUserModel.findById = () => ({ select: () => ({ lean: async () => account }) });
AdminUserModel.findOne = () => ({ select: async () => account });
let server, origin;
before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.get('/private', requireAdmin, (_req, res) => res.json({ allowed: true }));
  app.get('/public', (_req, res) => res.json({ public: true }));
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
const token = (extra = {}) => jwt.sign({ sub: '507f1f77bcf86cd799439011', role: 'admin', passwordVersion: 1000, ...extra }, process.env.JWT_SECRET, { expiresIn: 60 });
async function status(route, extra) { return (await fetch(origin + route, { headers: { Authorization: `Bearer ${token(extra)}` } })).status; }

test('production configuration rejects absent/default secrets without printing their values', () => {
  const entry = path.resolve(__dirname, '../dist/config/env.js');
  const base = { ...process.env, MONGODB_URI: '', JWT_SECRET: '', ADMIN_USERNAME: '', ADMIN_PASSWORD: '' };
  delete base.NODE_TEST_CONTEXT;
  for (const overrides of [{}, { JWT_SECRET: 'train-dare-secret-change-in-production' }, { JWT_SECRET: process.env.JWT_SECRET, ADMIN_USERNAME: 'test-admin', ADMIN_PASSWORD: 'admin' }]) {
    const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(entry)})`], { env: { ...base, ...overrides }, encoding: 'utf8', windowsHide: true });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Invalid production authentication configuration/);
    assert.ok(!result.stderr.includes('train-dare-secret-change-in-production'));
  }
  const valid = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(entry)})`], { env: { ...base, JWT_SECRET: process.env.JWT_SECRET, ADMIN_USERNAME: 'test-admin', ADMIN_PASSWORD: 'test-only-long-password' }, windowsHide: true });
  assert.equal(valid.status, 0);
});

test('Mongo account status, role, deletion and password changes revoke /me and protected writes', async () => {
  const active = { status: 'active', roles: ['editor'], username: 'test-admin', passwordChangedAt: new Date(1000) };
  account = active;
  assert.equal(await status('/api/auth/me'), 200);
  assert.equal(await status('/private'), 200);
  for (const revoked of [null, { ...active, status: 'disabled' }, { ...active, roles: ['author'] }, { ...active, passwordChangedAt: new Date(1001) }]) {
    account = revoked;
    assert.equal(await status('/api/auth/me'), 401);
    assert.equal(await status('/private'), 401);
  }
  account = active;
  assert.equal(await status('/private', { passwordVersion: undefined }), 401);
  ready = false;
  assert.equal(await status('/private'), 401);
  ready = true;
  assert.equal(await status('/private', { sub: 'admin' }), 401);
});

test('login never falls back to environment credentials when MongoDB rejects an account', async () => {
  account = null;
  const response = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }) });
  assert.equal(response.status, 401);
  ready = false;
  const unavailable = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'test-admin', password: 'test-password' }) });
  assert.equal(unavailable.status, 503);
  ready = true;
});

test('login limit returns 429, cannot be bypassed with X-Forwarded-For, leaves public routes accessible', async () => {
  for (let i = 0; i < 11; i++) {
    const response = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `192.0.2.${i}` }, body: '{}' });
    if (i >= 8) { assert.equal(response.status, 429); assert.ok(Number(response.headers.get('Retry-After')) > 0); }
  }
  assert.equal((await fetch(origin + '/public')).status, 200);
});

test('rate limit windows expire and distinct socket addresses have independent quotas', () => {
  let now = 0, passed = 0, code;
  const middleware = createLoginRateLimit(() => now);
  const res = { setHeader() {}, status(value) { code = value; return this; }, json() {} };
  const run = ip => middleware({ socket: { remoteAddress: ip } }, res, () => passed++);
  for (let i = 0; i < 11; i++) run('127.0.0.1');
  assert.equal(passed, 10); assert.equal(code, 429);
  run('127.0.0.2'); assert.equal(passed, 11);
  now = 900000; run('127.0.0.1'); assert.equal(passed, 12);
});
