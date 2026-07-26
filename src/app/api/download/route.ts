import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Issues a short-lived signed URL from the PRIVATE 'releases' bucket.
// Entitlement is resolved through the plan, so a bundle license can
// download both Orbit Studio and Orbit Premiere.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const channel = searchParams.get("channel") === "beta" ? "beta" : "stable";

  if (!slug)
    return NextResponse.json(
      { error: "Missing extension slug." },
      { status: 400 },
    );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const svc = createAdminClient();

  // Special fallback for Legacy CompX (v1.1.2 and v1.1.1)
  if (slug === "compx-v111") {
    // Check if signed link can be created directly from extensions bucket or fallback URL
    const { data: signed, error: signErr } = await svc.storage
      .from("extensions")
      .createSignedUrl("compx-v111/1.1.2/CompX-Precomp-Manager-v1.1.2.zxp", 120, { download: true });

    if (!signErr && signed?.signedUrl) {
      return NextResponse.json({ url: signed.signedUrl, version: "1.1.2" });
    }

    // Secondary fallback check in releases bucket
    const { data: signedRel, error: relErr } = await svc.storage
      .from("releases")
      .createSignedUrl("compx-v111/1.1.2/CompX-Precomp-Manager-v1.1.2.zxp", 120, { download: true });

    if (!relErr && signedRel?.signedUrl) {
      return NextResponse.json({ url: signedRel.signedUrl, version: "1.1.2" });
    }
  }

  const { data: ext } = await svc
    .from("extensions")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!ext)
    return NextResponse.json({ error: "Unknown extension." }, { status: 404 });

  // Does any active license owned by this user include this extension?
  const { data: entitled } = await svc
    .from("licenses")
    .select("id, plan_id, plans!inner(plan_extensions!inner(extension_id))")
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("plans.plan_extensions.extension_id", ext.id)
    .limit(1)
    .maybeSingle();

  if (!entitled)
    return NextResponse.json(
      {
        error: `Your licenses do not include ${ext.name}.`,
        code: "NOT_ENTITLED",
      },
      { status: 403 },
    );

  const { data: release } = await svc
    .from("releases")
    .select("version, storage_path, sha256, size_bytes")
    .eq("extension_id", ext.id)
    .eq("channel", channel)
    .eq("is_latest", true)
    .maybeSingle();

  if (!release)
    return NextResponse.json(
      { error: "No release has been published yet." },
      { status: 404 },
    );

  const { data: signed, error } = await svc.storage
    .from("releases")
    .createSignedUrl(release.storage_path, 60, { download: true });

  if (error || !signed)
    return NextResponse.json(
      { error: "Could not create the download link." },
      { status: 500 },
    );

  await svc.from("license_events").insert({
    license_id: entitled.id,
    user_id: user.id,
    event: "download",
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: req.headers.get("user-agent"),
    meta: { slug, version: release.version, channel, source: "dashboard" },
  });

  return NextResponse.json({
    url: signed.signedUrl,
    version: release.version,
    sha256: release.sha256,
    sizeBytes: release.size_bytes,
    expiresInSeconds: 60,
  });
}
