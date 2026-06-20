export const applicationConfig = {
  port: Number(process.env.APPLICATION_PORT || "4003"),
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PORT || "9000"),
    useSSL: String(process.env.MINIO_USE_SSL || "false") === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "applyhub",
    secretKey: process.env.MINIO_SECRET_KEY || "applyhub",
    bucket: process.env.MINIO_BUCKET || "applyhub-cv",
  },
  db: {
    host: process.env.APPLICATION_DB_HOST || "localhost",
    port: Number(process.env.APPLICATION_DB_PORT || "5432"),
    database: process.env.APPLICATION_DB_NAME || "application_db",
    user: process.env.APPLICATION_DB_USER || "applyhub",
    password: process.env.APPLICATION_DB_PASSWORD || "applyhub",
  },
};
