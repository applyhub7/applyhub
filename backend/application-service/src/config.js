export const applicationConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.APPLICATION_PORT || '4003'),
  minio: {
<<<<<<< Updated upstream
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
=======
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: Number(process.env.MINIO_PORT || '9000'),
    useSSL: String(process.env.MINIO_USE_SSL || 'false') === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'applyhub',
    secretKey: process.env.MINIO_SECRET_KEY || 'applyhub',
    bucket: process.env.MINIO_BUCKET || 'applyhub-cv',
    region: process.env.MINIO_REGION || 'ap-southeast-1',
  },
  db: {
    host: process.env.APPLICATION_DB_HOST || 'localhost',
    port: Number(process.env.APPLICATION_DB_PORT || '5432'),
    database: process.env.APPLICATION_DB_NAME || 'application_db',
    user: process.env.APPLICATION_DB_USER || 'applyhub',
    password: process.env.APPLICATION_DB_PASSWORD || 'applyhub',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
>>>>>>> Stashed changes
  },
};
