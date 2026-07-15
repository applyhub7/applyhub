import app from './app.js';
import { applicationConfig } from './config.js';

<<<<<<< Updated upstream
const app = Fastify({ logger: { level: applicationConfig.isProduction ? "info" : "debug" } });
await initApplicationDb();
await applicationRoutes(app);
app.listen({ port: applicationConfig.port, host: "0.0.0.0" });
=======
await app.listen({
  port: applicationConfig.port,
  host: '0.0.0.0',
});
>>>>>>> Stashed changes
