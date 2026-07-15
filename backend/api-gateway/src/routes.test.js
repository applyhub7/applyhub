import { describe, it, expect, vi } from 'vitest';
import { buildApp } from './app.js';

vi.mock('./proxy.js', () => ({
  forward: vi.fn((request, reply) => reply.send({ mocked: true })),
}));

describe('Route forwarding', () => {
  it('GET /jobs được forward đến job service', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/jobs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ mocked: true });
  });

  it('GET /auth không có CORS check khi không phải production', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/auth',
    });

    expect(response.statusCode).toBe(200);
  });
});