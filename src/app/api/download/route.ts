import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { compareSemanticVersions, findStorageRelease } from "@/lib/releases";

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
    // Try v1.1.2 first with exact uploaded filename
    const { data: signed112, error: signErr112 } = await svc.storage
      .from("extensions")
      .createSignedUrl("compx-v111/1.1.2/compX V1.1.2.zxp", 120, { download: true });

    if (!signErr112 && signed112?.signedUrl) {
      return NextResponse.json({ url: signed112.signedUrl, version: "1.1.2" });
    }

    // Try v1.1.2 formatted filename
    const { data: signed112Alt, error: signErr112Alt } = await svc.storage
      .from("extensions")
      .createSignedUrl("compx-v111/1.1.2/CompX-Precomp-Manager-v1.1.2.zxp", 120, { download: true });

    if (!signErr112Alt && signed112Alt?.signedUrl) {
      return NextResponse.json({ url: signed112Alt.signedUrl, version: "1.1.2" });
    }

    // Fallback to v1.1.1
    const { data: signed, error: signErr } = await svc.storage
      .from("extensions")
      .createSignedUrl("compx-v111/1.1.1/CompX-Precomp-Manager-v1.1.1.zxp", 120, { download: true });

    if (!signErr && signed?.signedUrl) {
      return NextResponse.json({ url: signed.signedUrl, version: "1.1.1" });
    }
  }

  // Windows 1-Click Suite Installer (.exe)
  if (slug === "windows-installer" || slug === "suite-installer") {
    const { data: entitled } = await svc
      .from("licenses")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!entitled)
      return NextResponse.json(
        { error: "Your account does not have an active license.", code: "NOT_ENTITLED" },
        { status: 403 },
      );

    const { data: signed, error: signErr } = await svc.storage
      .from("extensions")
      .createSignedUrl("suite-installer/2.4.14/CompX-Orbit-Suite-Setup-v2.4.14.exe", 120, { download: true });

    if (!signErr && signed?.signedUrl) {
      return NextResponse.json({ url: signed.signedUrl, version: "2.4.14" });
    }
  }

  // Orbit Studio / Premiere ZXP downloads
  if (slug === "orbit-studio" || slug === "orbit-premiere") {
    const { data: entitled } = await svc
      .from("licenses")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!entitled)
      return NextResponse.json(
        { error: "Your account does not have an active license.", code: "NOT_ENTITLED" },
        { status: 403 },
      );

    // Try database release first
    const { data: extRecord } = await svc
      .from("extensions")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (extRecord) {
      const { data: dbRelease } = await svc
        .from("releases")
        .select("version, storage_path")
        .eq("extension_id", extRecord.id)
        .eq("channel", channel)
        .eq("is_latest", true)
        .maybeSingle();

      if (dbRelease?.storage_path) {
        // Try extensions bucket
        const { data: signedExt, error: errExt } = await svc.storage
          .from("extensions")
          .createSignedUrl(dbRelease.storage_path, 120, { download: true });

        if (!errExt && signedExt?.signedUrl) {
          return NextResponse.json({ url: signedExt.signedUrl, version: dbRelease.version });
        }

        // Try releases bucket
        const { data: signedRel, error: errRel } = await svc.storage
          .from("releases")
          .createSignedUrl(dbRelease.storage_path, 120, { download: true });

        if (!errRel && signedRel?.signedUrl) {
          return NextResponse.json({ url: signedRel.signedUrl, version: dbRelease.version });
        }
      }
    }

    // Direct folder search fallback under extensions bucket
    const { data: folderFiles } = await svc.storage
      .from("extensions")
      .list(`${slug}/2.4.14`);

    if (folderFiles && folderFiles.length > 0) {
      const zxpFile = folderFiles.find((f) => f.name.endsWith(".zxp")) || folderFiles[0];
      const targetPath = `${slug}/2.4.14/${zxpFile.name}`;
      const { data: signed, error: signErr } = await svc.storage
        .from("extensions")
        .createSignedUrl(targetPath, 120, { download: true });

      if (!signErr && signed?.signedUrl) {
        return NextResponse.json({ url: signed.signedUrl, version: "2.4.14" });
      }
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

  const { data: databaseRelease } = await svc
    .from("releases")
    .select("version, storage_path, sha256, size_bytes")
    .eq("extension_id", ext.id)
    .eq("channel", channel)
    .eq("is_latest", true)
    .maybeSingle();

  const storageRelease = await findStorageRelease(svc, slug, channel);
  const useStorage = storageRelease && (
    !databaseRelease || compareSemanticVersions(storageRelease.version, databaseRelease.version) > 0
  );
  const release = useStorage ? {
    version: storageRelease.version,
    storage_path: storageRelease.storagePath,
    sha256: null,
    size_bytes: storageRelease.sizeBytes,
    bucket: storageRelease.bucket,
    source: "storage",
  } : databaseRelease ? {
    ...databaseRelease,
    bucket: "releases",
    source: "database",
  } : null;

  if (!release) {
    return NextResponse.json(
      { error: "No release has been published yet." },
      { status: 404 },
    );
  }

  const { data: signed, error } = await svc.storage
    .from(release.bucket)
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
    meta: { slug, version: release.version, channel, source: `dashboard:${release.source}` },
  });

  return NextResponse.json({
    url: signed.signedUrl,
    version: release.version,
    sha256: release.sha256,
    sizeBytes: release.size_bytes,
    expiresInSeconds: 60,
  });
}
