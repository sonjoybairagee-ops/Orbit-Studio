import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !service || !anon) {
  console.error("Missing Supabase URL or keys in .env.local");
  process.exit(1);
}

async function rest(key, path) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  const body = await response.text();
  return { status: response.status, body };
}

const tables = [
  "creatorlens_videos",
  "creatorlens_projects",
  "creatorlens_saved_videos",
  "creatorlens_transcripts",
  "creatorlens_analyses",
  "creatorlens_generations",
  "creatorlens_usage_events",
];

let failed = 0;
for (const table of tables) {
  const column = table === "creatorlens_videos" ? "youtube_video_id" : "id";
  const serviceHit = await rest(service, `${table}?select=${column}&limit=1`);
  const anonHit = await rest(anon, `${table}?select=${column}&limit=1`);
  const ok = serviceHit.status === 200 && anonHit.status !== 200;
  if (!ok) failed += 1;
  console.log(`${table}: service ${serviceHit.status} anon ${anonHit.status} ${ok ? "ok" : "FAIL"}`);
}

const catalogue = await rest(service, "extensions?slug=eq.creatorlens&select=slug,name,host_app");
console.log("catalogue:", catalogue.status, catalogue.body);
console.log("YOUTUBE_API_KEY", env.YOUTUBE_API_KEY ? "set" : "missing");
console.log("OPENAI_API_KEY", env.OPENAI_API_KEY ? "set" : "missing");
if (failed) process.exit(1);
