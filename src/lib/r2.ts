import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
export const r2BucketName = process.env.R2_BUCKET_NAME || "compx-assets";

const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

export const r2Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function getR2DownloadUrl(fileKey: string, expiresInSeconds = 300) {
  const customDomain = process.env.R2_PUBLIC_DOMAIN || "https://assets.compxorbit.com";
  const cleanDomain = customDomain.replace(/\/$/, "");
  const cleanKey = fileKey.replace(/^\//, "");
  return `${cleanDomain}/${cleanKey}`;
}
