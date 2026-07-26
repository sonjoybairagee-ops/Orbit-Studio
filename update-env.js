const fs = require('fs');
let env = fs.readFileSync('.env.local', 'utf8');

env = env.replace(/^R2_ACCESS_KEY_ID=.*$/m, 'R2_ACCESS_KEY_ID=c9d00ce7158df187c4451a4ea39ef602');
env = env.replace(/^R2_SECRET_ACCESS_KEY=.*$/m, 'R2_SECRET_ACCESS_KEY=478f106683f0fac1b3a618e2729b7ff6477f431d5242bb83a7079905b1e8fd6a');

fs.writeFileSync('.env.local', env, 'utf8');
