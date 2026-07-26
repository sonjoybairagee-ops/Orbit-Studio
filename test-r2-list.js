const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
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
  try {
    const command = new ListObjectsV2Command({ Bucket: env.R2_BUCKET_NAME || 'compx-assets' });
    const res = await r2Client.send(command);
    console.log('Success! Objects:', res.Contents?.map(c => c.Key));
  } catch (err) {
    console.log('Error:', err.message, err.name);
  }
}
run();
