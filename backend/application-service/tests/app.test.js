import { describe, it, expect } from 'vitest';
import app from '../src/app.js';

describe('Application Service', () => {
  it('trả về status ok và tên service', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
  });
});
