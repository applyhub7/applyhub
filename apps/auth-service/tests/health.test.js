import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

import { authRoutes } from '../src/routes.js';

const app = express();
await authRoutes(app);

const response = await request(app).get('/health');

assert.equal(response.status, 200);
assert.equal(response.body.status, 'healthy');
assert.equal(response.body.service, 'auth-service');
