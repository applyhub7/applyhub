import { describe, it, expect, vi } from 'vitest';

// Mock trước khi import app
vi.mock('../src/proxy.js', () => ({
  forward: vi.fn(async (request, reply) => {
    return reply.code(200).send({ mocked: true });
  }),
}));

import { buildApp } from '../src/app.js';

describe('Route forwarding', () => {
  it('GET /jobs được forward đến job service', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/jobs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ mocked: true });

    await app.close();
  });

  it('GET /auth không có CORS check khi không phải production', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/auth',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ mocked: true });

    await app.close();
  });
});
