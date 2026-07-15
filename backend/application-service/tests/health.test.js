import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/app.js');

const response = await app.inject({
  method: 'GET',
  url: '/health',
});

assert.equal(response.statusCode, 200);
assert.deepEqual(response.json(), {
  ok: true,
  service: 'application',
  environment: 'test',
});

await app.close();
