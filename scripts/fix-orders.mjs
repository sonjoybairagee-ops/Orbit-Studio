import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if(k && v.length > 0) acc[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  return acc;
}, {});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id,user_id,amount,currency,status,method,txn_ref,profiles!orders_user_id_fkey(email)&status=in.(rejected,pending)&order=created_at.desc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    console.error('Error:', await res.text());
    return;
  }
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main();
