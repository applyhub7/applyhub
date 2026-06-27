export const authConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  accessTtl: "15m",
  refreshTtl: "7d",
  port: Number(process.env.AUTH_PORT || "4001"),
  db: {
    host: process.env.AUTH_DB_HOST || "auth-db",
    port: Number(process.env.AUTH_DB_PORT || "5432"),
    database: process.env.AUTH_DB_NAME || "auth_db",
    user: process.env.AUTH_DB_USER || "applyhub",
    password: process.env.AUTH_DB_PASSWORD || "applyhub",
  },
};
