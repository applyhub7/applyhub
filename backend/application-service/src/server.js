import app from './app.js';
import { applicationConfig } from './config.js';

await app.listen({
  port: applicationConfig.port,
  host: '0.0.0.0',
});