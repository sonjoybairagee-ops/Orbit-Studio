import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if(k && v.length > 0) acc[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  return acc;
}, {});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const targetIds = [
    'a6e0615b-382e-47f0-b4e3-dbb51df16cb9',
    '447070c9-042e-484b-9ef9-656f91f99a21'
  ];
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=in.(${targetIds.join(',')})`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ status: 'pending' })
  });
  
  if (!res.ok) {
    console.error('Error:', await res.text());
    return;
  }
  
  const data = await res.json();
  console.log('Updated orders back to pending:', data.map(o => o.id));
}

main();
