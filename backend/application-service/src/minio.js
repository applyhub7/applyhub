import * as Minio from "minio";
import { applicationConfig } from "./config.js";

const minioClient = new Minio.Client({
  endPoint: applicationConfig.minio.endPoint,
  port: applicationConfig.minio.port,
  useSSL: applicationConfig.minio.useSSL,
  accessKey: applicationConfig.minio.accessKey,
  secretKey: applicationConfig.minio.secretKey,
  region: applicationConfig.minio.region
});

export async function ensureCvBucket() {
  const bucket = applicationConfig.minio.bucket;
  const exists = await minioClient.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return { buffer: Buffer.from(String(dataUrl), "base64"), contentType: "application/octet-stream" };
  }
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function uploadResume({ candidateId, jobId, fileName, dataUrl }) {
  const { buffer, contentType } = parseDataUrl(dataUrl);
  const bucket = applicationConfig.minio.bucket;
  const objectKey = `resumes/${candidateId}/${jobId}/${Date.now()}-${fileName}`.replace(/\s+/g, "-");

  await minioClient.putObject(bucket, objectKey, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  return {
    objectKey,
    fileName,
    contentType,
  };
}

export async function getResumeDownloadUrl(objectKey) {
  return await new Promise((resolve, reject) => {
    minioClient.presignedGetObject(applicationConfig.minio.bucket, objectKey, 60 * 30, (error, url) => {
      if (error) return reject(error);
      resolve(url);
    });
  });
}

export async function getResumeObject(objectKey) {
  const bucket = applicationConfig.minio.bucket;
  const [stat, stream] = await Promise.all([
    minioClient.statObject(bucket, objectKey),
    minioClient.getObject(bucket, objectKey),
  ]);
  return { stat, stream };
}
