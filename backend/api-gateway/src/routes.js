import { forward } from './proxy.js';
import { gatewayConfig } from './config.js';

export async function gatewayRoutes(app) {
  app.get('/health', async () => ({
    ok: true,
    service: 'gateway',
    environment: gatewayConfig.nodeEnv,
  }));
  app.all('/auth', async (request, reply) => forward(request, reply, gatewayConfig.authUrl, false));
  app.all('/auth/*', async (request, reply) =>
    forward(request, reply, gatewayConfig.authUrl, false)
  );
  app.all('/jobs', async (request, reply) => forward(request, reply, gatewayConfig.jobUrl));
  app.all('/jobs/*', async (request, reply) => forward(request, reply, gatewayConfig.jobUrl));
  app.all('/applications', async (request, reply) =>
    forward(request, reply, gatewayConfig.applicationUrl)
  );
  app.all('/applications/*', async (request, reply) =>
    forward(request, reply, gatewayConfig.applicationUrl)
  );
}
