#!/usr/bin/env node
/**
 * Generates the ES256 key pair used to sign entitlement tokens.
 *
 *   node scripts/generate-keys.mjs
 *
 * - PRIVATE key  -> Supabase secret  LICENSE_PRIVATE_KEY  (server only)
 * - PUBLIC  key  -> pasted into extension/license/compx-license.js
 *
 * Because the extension only ever holds the PUBLIC key, a cracked
 * panel cannot forge a token or extend its own offline grace window.
 */
import { generateKeyPair, exportPKCS8, exportJWK } from "jose";
import { writeFileSync, mkdirSync } from "node:fs";

const { publicKey, privateKey } = await generateKeyPair("ES256", {
  extractable: true,
});

const pkcs8 = await exportPKCS8(privateKey);
const publicJwk = await exportJWK(publicKey);
publicJwk.alg = "ES256";
publicJwk.use = "sig";

mkdirSync("keys", { recursive: true });
writeFileSync("keys/license-private.pem", pkcs8);
writeFileSync("keys/license-public.jwk.json", JSON.stringify(publicJwk, null, 2));

console.log("\n=========================================================");
console.log(" 1. PRIVATE KEY  ->  keys/license-private.pem");
console.log("    Store it as a Supabase secret:\n");
console.log("    supabase secrets set LICENSE_PRIVATE_KEY=\"$(cat keys/license-private.pem)\"");
console.log("\n    Windows CMD:");
console.log("    supabase secrets set --env-file keys/secrets.env");
console.log("\n---------------------------------------------------------");
console.log(" 2. PUBLIC KEY  ->  keys/license-public.jwk.json");
console.log("    Paste this object into compx-license.js as PUBLIC_JWK:\n");
console.log(JSON.stringify(publicJwk, null, 2));
console.log("=========================================================");
console.log("\n  Never commit keys/license-private.pem to git.\n");

// Windows-friendly secrets file (escaped newlines)
writeFileSync(
  "keys/secrets.env",
  `LICENSE_PRIVATE_KEY="${pkcs8.replace(/\n/g, "\\n")}"\n`,
);
