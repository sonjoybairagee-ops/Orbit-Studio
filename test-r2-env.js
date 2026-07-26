const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});
console.log('R2_ACCOUNT_ID exists?', !!env.R2_ACCOUNT_ID);
console.log('R2_ACCESS_KEY_ID exists?', !!env.R2_ACCESS_KEY_ID);
console.log('R2_SECRET_ACCESS_KEY exists?', !!env.R2_SECRET_ACCESS_KEY);
