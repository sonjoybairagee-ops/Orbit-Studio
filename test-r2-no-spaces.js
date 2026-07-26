const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const r2Client = new S3Client({
  region: 'auto',
  endpoint: 'https://' + env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME || 'compx-assets',
    Key: '50-Mogrt-pack.rar',
  });
  const url = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  console.log('Signed URL:', url);
  
  const res = await fetch(url);
  console.log('Status:', res.status);
  if (!res.ok) console.log('Error text:', await res.text());
}
run();
