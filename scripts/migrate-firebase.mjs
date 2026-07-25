#!/usr/bin/env node
/**
 * Migrates CompX v1.1.1 users from Firestore to Supabase.
 *
 *   1) Export Firestore:
 *        gcloud firestore export gs://<bucket>/compx-export
 *      ...or simply download the `users` collection as JSON from the
 *      Firebase console. Expected shape (array or {docs:[...]}):
 *        { id, email, emailLower, licenseKey, isActive, expiresAt, deviceId }
 *
 *   2) Run:
 *        SUPABASE_URL=https://esiiawfjzmuqplzzdoog.supabase.co \\
 *        SUPABASE_SERVICE_ROLE_KEY=xxxx \\
 *        node scripts/migrate-firebase.mjs users.json
 *
 *   3) Add --commit to actually write. Without it the script only
 *      previews what it would do.
 *
 * Every migrated user receives a `legacy_demo` license that unlocks
 * CompX v1.1.1 ONLY. Orbit Studio must be purchased separately.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const FILE = process.argv[2];
const COMMIT = process.argv.includes("--commit");

if (!FILE) {
  console.error("usage: node scripts/migrate-firebase.mjs users.json [--commit]");
  process.exit(1);
}

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const raw = JSON.parse(readFileSync(FILE, "utf8"));
const docs = Array.isArray(raw) ? raw : (raw.docs ?? raw.users ?? []);
console.log(`Loaded ${docs.length} legacy records from ${FILE}\n`);

const toDate = (v) => {
  if (!v) return null;
  if (typeof v === "string") return new Date(v);
  if (v._seconds) return new Date(v._seconds * 1000);
  if (v.seconds) return new Date(v.seconds * 1000);
  return null;
};

const report = [];
let created = 0, skipped = 0, failed = 0;

for (const doc of docs) {
  const data = doc.data ?? doc;
  const email = String(data.emailLower ?? data.email ?? doc.id ?? "")
    .trim().toLowerCase();

  if (!email.includes("@")) {
    console.log(`  skip (no email): ${doc.id}`);
    skipped++; continue;
  }

  const expires = toDate(data.expiresAt);
  const active = data.isActive === true &&
    (!expires || expires.getTime() > Date.now());

  if (!active) {
    console.log(`  skip (inactive/expired): ${email}`);
    skipped++; continue;
  }

  if (!COMMIT) {
    console.log(`  would migrate: ${email}`);
    report.push({ email, status: "preview" });
    created++; continue;
  }

  try {
    // 1. auth user (invite so they set their own password)
    let userId;
    const { data: existing } = await db.auth.admin.listUsers({ page: 1, perPage: 1 });
    const { data: made, error: authErr } = await db.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { legacy_source: "firebase", legacy_doc_id: doc.id },
    });

    if (authErr && !String(authErr.message).match(/already|registered|exists/i)) {
      throw authErr;
    }

    if (made?.user) {
      userId = made.user.id;
    } else {
      const { data: found } = await db
        .from("profiles").select("id").ilike("email", email).maybeSingle();
      userId = found?.id;
    }
    if (!userId) throw new Error("could not resolve user id");

    await db.from("profiles")
      .update({ legacy_source: "firebase" })
      .eq("id", userId);

    // 2. skip if they already hold a legacy license
    const { data: has } = await db
      .from("licenses").select("id, key")
      .eq("user_id", userId).eq("license_type", "legacy_demo").maybeSingle();

    if (has) {
      console.log(`  exists: ${email} -> ${has.key}`);
      report.push({ email, key: has.key, status: "existing" });
      skipped++; continue;
    }

    // 3. issue the legacy license (v1.1.1 only, never expires)
    const { data: lic, error: licErr } = await db.rpc("issue_license", {
      p_user_id: userId,
      p_plan_slug: "legacy-demo",
      p_order_id: null,
      p_type: "legacy_demo",
      p_expires: null,
      p_legacy_email: email,
    });
    if (licErr) throw licErr;

    // 4. carry the old device binding across so nobody has to re-activate
    if (data.deviceId) {
      await db.from("activations").insert({
        license_id: lic.id,
        device_hash: "legacy:" + data.deviceId,
        device_label: "Migrated from Firebase",
        host_apps: ["AEFT"],
      });
    }

    console.log(`  migrated: ${email} -> ${lic.key}`);
    report.push({ email, key: lic.key, status: "created" });
    created++;
  } catch (e) {
    console.error(`  FAILED ${email}: ${e.message}`);
    report.push({ email, status: "failed", error: e.message });
    failed++;
  }
}

writeFileSync("migration-report.json", JSON.stringify(report, null, 2));
console.log(`\n${COMMIT ? "Migrated" : "Would migrate"}: ${created}   skipped: ${skipped}   failed: ${failed}`);
console.log("Report written to migration-report.json");
if (!COMMIT) console.log("\nRe-run with --commit to apply.");
