const fs = require('fs');
let env = fs.readFileSync('.env.local', 'utf8');

env = env.replace(/^R2_ACCESS_KEY_ID=.*$/m, 'R2_ACCESS_KEY_ID=c9d00ce7158df187c4451a4ca39ef602');

fs.writeFileSync('.env.local', env, 'utf8');
