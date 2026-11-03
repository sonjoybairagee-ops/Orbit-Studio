import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Dedicated Agency OS Cloudflare R2 Bucket Configuration
const accountId = process.env.AGENCY_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.AGENCY_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.AGENCY_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;

// Strictly targets the Agency OS media bucket (compx-orbit-agency-storage)
export const agencyBucketName =
  process.env.AGENCY_R2_BUCKET_NAME || "compx-orbit-agency-storage";

const endpoint =
  process.env.AGENCY_R2_ENDPOINT ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

export const agencyR2Client = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

/**
 * Generate a short-lived signed GET URL specifically for Agency OS media assets in compx-orbit-agency-storage.
 */
export async function getAgencyR2SignedDownloadUrl(
  fileKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  const customDomain = process.env.AGENCY_R2_PUBLIC_DOMAIN;
  if (customDomain) {
    const cleanDomain = customDomain.replace(/\/$/, "");
    const cleanKey = fileKey.replace(/^\//, "");
    return `${cleanDomain}/${cleanKey}`;
  }

  const command = new GetObjectCommand({
    Bucket: agencyBucketName,
    Key: fileKey,
  });

  return await getSignedUrl(agencyR2Client, command, { expiresIn: expiresInSeconds });
}
