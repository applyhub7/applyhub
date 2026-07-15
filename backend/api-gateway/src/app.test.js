import { describe, it, expect } from 'vitest';
import { buildApp } from './app.js';

describe('GET /health', () => {
  it('trả về status ok và tên service', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe('gateway');
  });
});