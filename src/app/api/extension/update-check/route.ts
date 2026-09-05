import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getR2DownloadUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Helper function to compare semver strings (e.g. 2.4.15 vs 2.4.14)
function isNewerVersion(latest: string, current: string): boolean {
  if (!current || !latest) return false;
  const parse = (v: string) => v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
  const l = parse(latest);
  const c = parse(current);

  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lPart = l[i] || 0;
    const cPart = c[i] || 0;
    if (lPart > cPart) return true;
    if (lPart < cPart) return false;
  }
  return false;
}

// Default release registry fallbacks
const DEFAULT_LATEST: Record<
  string,
  {
    version: string;
    r2Key?: string;
    publicUrl: string;
    releaseNotes: string[];
    isMandatory?: boolean;
    minHostVersion?: string;
  }
> = {
  "orbit-studio": {
    version: "2.4.15",
    r2Key: "CompX-Orbit-Studio-v2.4.15.zxp",
    publicUrl: "https://assets.compxorbit.com/CompX-Orbit-Studio-v2.4.15.zxp",
    releaseNotes: [
      "High-speed Cloudflare R2 asset streaming and downloads.",
      "Optimized Color Plates and Motion Lab layer engine.",
      "Enhanced compatibility with After Effects 2024 & 2025.",
      "Auto-license synchronizer and offline stability improvements.",
    ],
    isMandatory: false,
    minHostVersion: "2021",
  },
  "orbit-premiere": {
    version: "2.4.15",
    r2Key: "CompX-Orbit-Premiere-v2.4.15.zxp",
    publicUrl: "https://assets.compxorbit.com/CompX-Orbit-Premiere-v2.4.15.zxp",
    releaseNotes: [
      "Premiere Pro essential cut tools & workflow actions.",
      "Fast caption & typography presets integration.",
      "Multi-host device seat synchronization.",
    ],
    isMandatory: false,
    minHostVersion: "2021",
  },
  "compx-legacy": {
    version: "1.1.2",
    publicUrl: "https://assets.compxorbit.com/CompX-Precomp-Manager-v1.1.2.zxp",
    releaseNotes: ["Legacy Precomp manager maintenance update."],
    isMandatory: false,
  },
};

export async function GET(req: Request) {
  return handleUpdateCheck(req);
}

export async function POST(req: Request) {
  return handleUpdateCheck(req);
}

async function handleUpdateCheck(req: Request) {
  try {
    let slug = "orbit-studio";
    let currentVersion = "1.0.0";
    let licenseKey = "";
    let hostApp = "";

    if (req.method === "POST") {
      try {
        const body = await req.json();
        slug = body.slug || slug;
        currentVersion = body.version || body.currentVersion || currentVersion;
        licenseKey = body.key || body.licenseKey || "";
        hostApp = body.hostApp || "";
      } catch {
        // use defaults
      }
    } else {
      const { searchParams } = new URL(req.url);
      slug = searchParams.get("slug") || slug;
      currentVersion = searchParams.get("version") || searchParams.get("currentVersion") || currentVersion;
      licenseKey = searchParams.get("key") || "";
      hostApp = searchParams.get("hostApp") || "";
    }

    // Normalize slug
    if (slug.includes("premiere") || hostApp === "PPRO") {
      slug = "orbit-premiere";
    } else if (slug.includes("legacy") || slug.includes("111")) {
      slug = "compx-legacy";
    } else {
      slug = "orbit-studio";
    }

    const s = createAdminClient();

    // Check if database has updated release info in extensions table
    const { data: ext } = await s
      .from("extensions")
      .select("id, name, latest_version, description")
      .eq("slug", slug)
      .maybeSingle();

    const fallback = DEFAULT_LATEST[slug] || DEFAULT_LATEST["orbit-studio"];
    const latestVersion = ext?.latest_version || fallback.version;
    const hasUpdate = isNewerVersion(latestVersion, currentVersion);

    let downloadUrl = fallback.publicUrl;
    if (fallback.r2Key) {
      try {
        const signedR2 = await getR2DownloadUrl(fallback.r2Key, 3600);
        if (signedR2) downloadUrl = signedR2;
      } catch (err) {
        console.error("Failed to generate signed R2 URL for update:", err);
      }
    }

    // Optional license validation if key provided
    let isLicenseActive = true;
    if (licenseKey) {
      const { data: lic } = await s
        .from("licenses")
        .select("status")
        .eq("key", licenseKey.trim().toUpperCase())
        .maybeSingle();
      if (lic && lic.status !== "active") {
        isLicenseActive = false;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        slug,
        name: ext?.name || (slug === "orbit-premiere" ? "CompX Orbit Premiere" : "CompX Orbit Studio"),
        currentVersion,
        latestVersion,
        hasUpdate,
        isMandatory: fallback.isMandatory || false,
        releaseNotes: fallback.releaseNotes,
        downloadUrl,
        dashboardUrl: "https://compxorbit.com/dashboard",
        isLicenseActive,
        checkedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error: any) {
    console.error("Update check error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Could not check for updates",
        hasUpdate: false,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
