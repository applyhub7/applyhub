import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';

const app = await buildApp();

const response = await app.inject({
  method: 'GET',
  url: '/health',
});

assert.equal(response.statusCode, 200);
assert.equal(response.json().ok, true);
assert.equal(response.json().service, 'gateway');

await app.close();
