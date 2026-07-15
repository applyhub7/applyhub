import { buildApp } from './app.js';
import { gatewayConfig } from './config.js';

const app = await buildApp();
app.listen({ port: gatewayConfig.port, host: '0.0.0.0' });