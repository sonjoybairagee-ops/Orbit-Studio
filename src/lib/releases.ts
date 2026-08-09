import type { SupabaseClient } from "@supabase/supabase-js";

type StorageRelease = {
  version: string;
  bucket: "extensions";
  storagePath: string;
  sizeBytes: number | null;
  publishedAt: string | null;
};

function versionParts(version: string) {
  const match = String(version).trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) return null;
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

export function compareSemanticVersions(a: string, b: string) {
  const left = versionParts(a);
  const right = versionParts(b);
  if (!left || !right) return 0;
  for (let i = 0; i < 3; i++) {
    if (left.core[i] !== right.core[i]) return left.core[i] > right.core[i] ? 1 : -1;
  }
  if (!left.prerelease.length && right.prerelease.length) return 1;
  if (left.prerelease.length && !right.prerelease.length) return -1;
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let i = 0; i < length; i++) {
    if (left.prerelease[i] === undefined) return -1;
    if (right.prerelease[i] === undefined) return 1;
    const leftNumber = /^\d+$/.test(left.prerelease[i]) ? Number(left.prerelease[i]) : null;
    const rightNumber = /^\d+$/.test(right.prerelease[i]) ? Number(right.prerelease[i]) : null;
    if (leftNumber !== null && rightNumber !== null && leftNumber !== rightNumber) {
      return leftNumber > rightNumber ? 1 : -1;
    }
    if (leftNumber !== null && rightNumber === null) return -1;
    if (leftNumber === null && rightNumber !== null) return 1;
    if (left.prerelease[i] !== right.prerelease[i]) {
      return left.prerelease[i] > right.prerelease[i] ? 1 : -1;
    }
  }
  return 0;
}

export async function findStorageRelease(
  supabase: SupabaseClient,
  slug: string,
  channel: "stable" | "beta" = "stable",
): Promise<StorageRelease | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const basePath = channel === "beta" ? `${slug}/beta` : slug;
  const { data: entries, error } = await supabase.storage
    .from("extensions")
    .list(basePath, { limit: 100, sortBy: { column: "name", order: "desc" } });
  if (error || !entries) return null;

  const versions = entries
    .map((entry) => entry.name)
    .filter((name) => versionParts(name) !== null)
    .sort((a, b) => compareSemanticVersions(b, a));

  for (const version of versions) {
    const versionPath = `${basePath}/${version}`;
    const { data: files, error: filesError } = await supabase.storage
      .from("extensions")
      .list(versionPath, { limit: 100, sortBy: { column: "updated_at", order: "desc" } });
    if (filesError || !files) continue;
    const packageFile = files.find((file) => file.name.toLowerCase().endsWith(".zxp"));
    if (!packageFile) continue;
    const metadata = packageFile.metadata as Record<string, unknown> | null;
    return {
      version: version.replace(/^v/i, ""),
      bucket: "extensions",
      storagePath: `${versionPath}/${packageFile.name}`,
      sizeBytes: metadata && typeof metadata.size === "number" ? metadata.size : null,
      publishedAt: packageFile.updated_at ?? packageFile.created_at ?? null,
    };
  }
  return null;
}
