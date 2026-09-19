import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export async function uploadFileToR2(filePath, r2Key) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Local file does not exist: ${filePath}`);
  }
  const stat = fs.statSync(filePath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`Starting upload for ${r2Key} (${sizeMb} MB)...`);

  const fileStream = fs.createReadStream(filePath);
  const cmd = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    Body: fileStream,
    ContentLength: stat.size,
    ContentType: "application/zxp",
  });

  const t0 = Date.now();
  await r2.send(cmd);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✓ Successfully uploaded ${r2Key} to ${bucketName} in ${elapsed}s!`);
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length >= 2) {
    await uploadFileToR2(args[0], args[1]);
  } else {
    console.log("Usage: node scripts/upload-zxp-to-r2.mjs <filePath> <r2Key>");
  }
}

run().catch(console.error);
