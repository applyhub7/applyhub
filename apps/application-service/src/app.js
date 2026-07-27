import Fastify from 'fastify';
import { applicationRoutes } from './routes.js';
import { applicationConfig } from './config.js';
import { initApplicationDb } from './db.js';

const app = Fastify({
  logger: {
    level: applicationConfig.isProduction ? 'info' : 'debug',
  },
});

await initApplicationDb();
await applicationRoutes(app);

export default app;
