export const gatewayConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.GATEWAY_PORT || '4000'),
  authUrl: process.env.AUTH_URL || 'http://localhost:4001',
  jobUrl: process.env.JOB_URL || 'http://localhost:4002',
  applicationUrl: process.env.APPLICATION_URL || 'http://localhost:4003',
};
