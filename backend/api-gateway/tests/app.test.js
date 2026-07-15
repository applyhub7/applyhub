import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/app.js';

describe('GET /health', () => {
  it('trả về status ok và tên service', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toMatchObject({
      ok: true,
      service: 'gateway',
    });

    await app.close();
  });
});