import fs from "fs";
import path from "path";
import { S3Client, ListObjectsV2Command, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || "";
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const accountId = env.R2_ACCOUNT_ID;
const accessKeyId = env.R2_ACCESS_KEY_ID;
const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
const bucketName = env.R2_BUCKET_NAME || "compx-assets";

console.log("R2 Config:", { accountId, bucketName, hasKey: !!accessKeyId, hasSecret: !!secretAccessKey });

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

async function listBucket() {
  const cmd = new ListObjectsV2Command({ Bucket: bucketName });
  const res = await r2.send(cmd);
  console.log(`\n=== OBJECTS IN ${bucketName} ===`);
  for (const obj of res.Contents || []) {
    console.log(`- ${obj.Key} (${(obj.Size / (1024 * 1024)).toFixed(2)} MB, LastModified: ${obj.LastModified})`);
  }
}

listBucket().catch(console.error);
