import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
fs.readFileSync(".env.local", "utf8").split("\n").forEach(line => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let val = m[2] || "";
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[m[1]] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Fetching orbit-studio extension...");
  const { data: ext, error: extErr } = await supabase
    .from("extensions")
    .select("id")
    .eq("slug", "orbit-studio")
    .single();

  if (extErr || !ext) {
    console.error("Failed to find orbit-studio extension:", extErr);
    process.exit(1);
  }

  console.log("Found extension id:", ext.id);

  // Set previous releases is_latest = false
  const { error: updErr } = await supabase
    .from("releases")
    .update({ is_latest: false })
    .eq("extension_id", ext.id)
    .eq("channel", "stable")
    .eq("is_latest", true);

  if (updErr) {
    console.error("Failed to update old releases:", updErr);
  } else {
    console.log("Old releases marked as not latest.");
  }

  // Upsert new release 3.0.0
  const { data: insData, error: insErr } = await supabase
    .from("releases")
    .upsert(
      {
        extension_id: ext.id,
        version: "3.0.0",
        channel: "stable",
        storage_path: "CompX-Orbit-Studio-v3.0.0.zxp",
        sha256: "3d1e5c054310d4542b61d03219947172e66e3d983fbbdf50cd6171de39462a73",
        size_bytes: 34845746,
        min_host_version: "2021",
        min_app_version: "3.0.0",
        notes: "v3.0.0 - Orbit Studio 3.0.0 major update with performance optimizations and new features.",
        is_latest: true,
        published_at: new Date().toISOString(),
      },
      { onConflict: "extension_id,version,channel" }
    )
    .select();

  if (insErr) {
    console.error("Failed to insert release:", insErr);
    process.exit(1);
  }

  console.log("Successfully published Orbit Studio 3.0.0 release:", insData);
}

run();
