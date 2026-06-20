export const gatewayConfig = {
  port: Number(process.env.GATEWAY_PORT || "4000"),
  authUrl: process.env.AUTH_URL || "http://localhost:4001",
  jobUrl: process.env.JOB_URL || "http://localhost:4002",
  applicationUrl: process.env.APPLICATION_URL || "http://localhost:4003",
};
