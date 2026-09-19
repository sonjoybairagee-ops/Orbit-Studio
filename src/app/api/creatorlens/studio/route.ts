import { z } from "zod";
import { corsJson, corsPreflight } from "@/lib/extension-cors";
import { requireCreatorLensSession } from "@/lib/creatorlens-license";
import { inputHash } from "@/lib/video-intelligence";
import { applySimilarityGuard, generateStudio, STUDIO_VERSION, studioHash } from "@/lib/studio-intelligence";
import { DAILY_UNITS, dailyUsage, recordUsage } from "@/lib/creatorlens-usage";

const KINDS = ["project_intel", "gaps", "concepts", "hooks", "titles", "blueprint", "edit_plan"] as const;
const schema = z.object({
  token: z.string(),
  deviceId: z.string().min(6),
  op: z.enum(["run", "latest", "usage"]),
  kind: z.enum(KINDS).optional(),
  projectId: z.string().uuid().optional(),
  videoId: z.string().optional(),
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return corsJson({ error: "Invalid studio request." }, { status: 400 });
  const session = await requireCreatorLensSession(parsed.data.token, parsed.data.deviceId);
  if (!session.ok) return corsJson(session.body, { status: session.status });
  const { admin, licenseId } = session;

  if (parsed.data.op === "usage") {
    const usage = await dailyUsage(admin, licenseId);
    if (!usage.ok) return corsJson({ error: "Usage accounting is not deployed yet." }, { status: 503 });
    return corsJson({ usage: { used: usage.used, limit: usage.limit, remaining: usage.remaining } });
  }

  if (!parsed.data.projectId) return corsJson({ error: "Choose a research project first." }, { status: 400 });
  const project = await admin.from("creatorlens_projects").select("id,name").eq("id", parsed.data.projectId).eq("license_id", licenseId).maybeSingle();
  if (!project.data) return corsJson({ error: "That project was not found." }, { status: 404 });

  const videos = await admin.from("creatorlens_saved_videos").select("youtube_video_id,title,user_notes").eq("project_id", parsed.data.projectId).eq("license_id", licenseId);
  const saved = videos.data ?? [];
  if (saved.length < 1) return corsJson({ error: "Save at least one video to this project first." }, { status: 400 });
  const sourceTitles = saved.map((row) => row.title || row.youtube_video_id);

  if (parsed.data.op === "latest") {
    const kinds = parsed.data.kind ? [parsed.data.kind] : [...KINDS];
    const { data, error } = await admin
      .from("creatorlens_generations")
      .select("kind,result_json,model,generation_version,created_at")
      .eq("license_id", licenseId)
      .eq("project_id", parsed.data.projectId)
      .in("kind", kinds)
      .order("created_at", { ascending: false });
    if (error) return corsJson({ error: "Studio storage is not deployed yet." }, { status: 503 });
    const latest: Record<string, unknown> = {};
    for (const row of data ?? []) if (!latest[row.kind]) latest[row.kind] = { ...row.result_json, model: row.model, version: row.generation_version, createdAt: row.created_at, cached: true };
    return corsJson({ generations: latest });
  }

  const kind = parsed.data.kind;
  if (!kind) return corsJson({ error: "Choose a studio task." }, { status: 400 });
  if ((kind === "project_intel" || kind === "gaps") && saved.length < 2) return corsJson({ error: "Add at least two saved videos for project intelligence." }, { status: 400 });

  const analyses = await admin.from("creatorlens_analyses").select("youtube_video_id,result_json").eq("license_id", licenseId).in("youtube_video_id", saved.map((row) => row.youtube_video_id));
  const source = JSON.stringify({
    project: project.data.name,
    videos: saved,
    analyses: analyses.data ?? [],
    focusVideo: parsed.data.videoId ?? null,
  });
  const hash = studioHash(kind, source);

  const existing = await admin.from("creatorlens_generations").select("result_json,model,generation_version,created_at").eq("license_id", licenseId).eq("kind", kind).eq("input_hash", hash).maybeSingle();
  if (!existing.error && existing.data) {
    return corsJson({ generation: { ...existing.data.result_json, model: existing.data.model, version: existing.data.generation_version, createdAt: existing.data.created_at, cached: true, kind } });
  }

  const usage = await dailyUsage(admin, licenseId);
  if (!usage.ok) return corsJson({ error: "Usage accounting is not deployed yet." }, { status: 503 });
  if (usage.used >= DAILY_UNITS) return corsJson({ error: "Daily Compx Creator AI limit reached." }, { status: 429 });

  const generated = await generateStudio(kind, source);
  if (!generated.ok) return corsJson({ error: generated.error }, { status: generated.status });
  const guarded = applySimilarityGuard(kind, generated.json, sourceTitles);
  if (!guarded.ok) return corsJson({ error: guarded.error }, { status: 422 });

  const inserted = await admin.from("creatorlens_generations").insert({
    license_id: licenseId,
    project_id: parsed.data.projectId,
    youtube_video_id: parsed.data.videoId ?? null,
    kind,
    model: generated.model,
    generation_version: STUDIO_VERSION,
    input_hash: hash,
    result_json: guarded.result,
  }).select("result_json,model,generation_version,created_at").single();

  if (inserted.error || !inserted.data) {
    if (inserted.error?.code === "23505") {
      const again = await admin.from("creatorlens_generations").select("result_json,model,generation_version,created_at").eq("license_id", licenseId).eq("kind", kind).eq("input_hash", hash).maybeSingle();
      if (again.data) return corsJson({ generation: { ...again.data.result_json, model: again.data.model, version: again.data.generation_version, createdAt: again.data.created_at, cached: true, kind } });
    }
    return corsJson({ error: "Could not store that studio result." }, { status: 503 });
  }

  await recordUsage(admin, licenseId, kind, inputHash({ licenseId, kind, hash, at: "run" }));
  return corsJson({
    generation: {
      ...inserted.data.result_json,
      model: generated.model,
      version: STUDIO_VERSION,
      createdAt: inserted.data.created_at,
      cached: false,
      kind,
    },
  });
}
