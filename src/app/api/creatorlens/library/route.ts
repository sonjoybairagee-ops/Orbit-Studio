import { z } from "zod";
import { corsJson, corsPreflight } from "@/lib/extension-cors";
import { requireCreatorLensSession } from "@/lib/creatorlens-license";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const MAX_PROJECTS = 50;
const MAX_VIDEOS = 100;

const schema = z.object({
  token: z.string(),
  deviceId: z.string().min(6),
  op: z.enum(["list", "create", "rename", "delete", "items", "save", "note", "unsave"]),
  projectId: z.string().uuid().optional(),
  videoRowId: z.string().uuid().optional(),
  name: z.string().max(120).optional(),
  description: z.string().max(10000).optional(),
  videoId: z.string().optional(),
  title: z.string().max(500).optional(),
  notes: z.string().max(10000).optional(),
});

export function OPTIONS() {
  return corsPreflight();
}

function mappedError(error: { code?: string; message?: string } | null) {
  if (error?.code === "23505") return { status: 409 as const, error: "This video is already saved in that project." };
  if (error?.code === "23503") return { status: 404 as const, error: "That project was not found." };
  if (error?.code === "23514") return { status: 400 as const, error: "Check the name, notes or video ID and try again." };
  return { status: 500 as const, error: "Could not update your library. Try again." };
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return corsJson({ error: "Invalid library request." }, { status: 400 });
  const session = await requireCreatorLensSession(parsed.data.token, parsed.data.deviceId);
  if (!session.ok) return corsJson(session.body, { status: session.status });
  const { admin, licenseId } = session;
  const body = parsed.data;

  try {
    if (body.op === "list") {
      const { data, error } = await admin
        .from("creatorlens_projects")
        .select("id,name,description,created_at,updated_at,creatorlens_saved_videos(id)")
        .eq("license_id", licenseId)
        .order("updated_at", { ascending: false });
      if (error) return corsJson({ error: "Projects are not available yet. Deploy the CompX library migration." }, { status: 503 });
      return corsJson({
        projects: (data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          videoCount: Array.isArray(row.creatorlens_saved_videos) ? row.creatorlens_saved_videos.length : 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      });
    }

    if (body.op === "create") {
      const name = body.name?.trim() ?? "";
      if (name.length < 1) return corsJson({ error: "Enter a project name." }, { status: 400 });
      const existing = await admin.from("creatorlens_projects").select("id", { count: "exact", head: true }).eq("license_id", licenseId);
      if ((existing.count ?? 0) >= MAX_PROJECTS) return corsJson({ error: "Project limit reached." }, { status: 400 });
      const { data, error } = await admin
        .from("creatorlens_projects")
        .insert({ license_id: licenseId, name, description: body.description?.trim() ?? "" })
        .select("id,name,description,created_at,updated_at")
        .single();
      if (error || !data) {
        const mapped = mappedError(error);
        return corsJson({ error: mapped.error }, { status: mapped.status });
      }
      return corsJson({ project: { ...data, videoCount: 0, createdAt: data.created_at, updatedAt: data.updated_at } });
    }

    if (body.op === "rename") {
      if (!body.projectId || !body.name?.trim()) return corsJson({ error: "Enter a project name." }, { status: 400 });
      const { data, error } = await admin
        .from("creatorlens_projects")
        .update({ name: body.name.trim(), description: body.description ?? "", updated_at: new Date().toISOString() })
        .eq("id", body.projectId)
        .eq("license_id", licenseId)
        .select("id,name,description,created_at,updated_at")
        .maybeSingle();
      if (error) {
        const mapped = mappedError(error);
        return corsJson({ error: mapped.error }, { status: mapped.status });
      }
      if (!data) return corsJson({ error: "That project was not found." }, { status: 404 });
      return corsJson({ project: { ...data, createdAt: data.created_at, updatedAt: data.updated_at } });
    }

    if (body.op === "delete") {
      if (!body.projectId) return corsJson({ error: "Missing project." }, { status: 400 });
      const { data, error } = await admin
        .from("creatorlens_projects")
        .delete()
        .eq("id", body.projectId)
        .eq("license_id", licenseId)
        .select("id")
        .maybeSingle();
      if (error) {
        const mapped = mappedError(error);
        return corsJson({ error: mapped.error }, { status: mapped.status });
      }
      if (!data) return corsJson({ error: "That project was not found." }, { status: 404 });
      return corsJson({ ok: true });
    }

    if (body.op === "items") {
      if (!body.projectId) return corsJson({ error: "Missing project." }, { status: 400 });
      const project = await admin.from("creatorlens_projects").select("id,name,description,created_at,updated_at").eq("id", body.projectId).eq("license_id", licenseId).maybeSingle();
      if (project.error || !project.data) return corsJson({ error: "That project was not found." }, { status: 404 });
      const videos = await admin
        .from("creatorlens_saved_videos")
        .select("id,youtube_video_id,title,user_notes,created_at,updated_at")
        .eq("project_id", body.projectId)
        .eq("license_id", licenseId)
        .order("created_at", { ascending: false });
      if (videos.error) return corsJson({ error: "Could not load saved videos." }, { status: 500 });
      return corsJson({
        project: { id: project.data.id, name: project.data.name, description: project.data.description },
        videos: (videos.data ?? []).map((row) => ({
          id: row.id,
          videoId: row.youtube_video_id,
          title: row.title,
          notes: row.user_notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      });
    }

    if (body.op === "save") {
      if (!body.projectId || !body.videoId || !VIDEO_ID.test(body.videoId)) return corsJson({ error: "Choose a project and a supported video." }, { status: 400 });
      const owned = await admin.from("creatorlens_projects").select("id").eq("id", body.projectId).eq("license_id", licenseId).maybeSingle();
      if (!owned.data) return corsJson({ error: "That project was not found." }, { status: 404 });
      const count = await admin.from("creatorlens_saved_videos").select("id", { count: "exact", head: true }).eq("project_id", body.projectId);
      if ((count.count ?? 0) >= MAX_VIDEOS) return corsJson({ error: "This project is full." }, { status: 400 });
      const { data, error } = await admin
        .from("creatorlens_saved_videos")
        .insert({
          project_id: body.projectId,
          license_id: licenseId,
          youtube_video_id: body.videoId,
          title: (body.title ?? "").slice(0, 500),
          user_notes: body.notes ?? "",
        })
        .select("id,youtube_video_id,title,user_notes,created_at,updated_at")
        .single();
      if (error || !data) {
        const mapped = mappedError(error);
        return corsJson({ error: mapped.error }, { status: mapped.status });
      }
      await admin.from("creatorlens_projects").update({ updated_at: new Date().toISOString() }).eq("id", body.projectId).eq("license_id", licenseId);
      return corsJson({
        video: { id: data.id, videoId: data.youtube_video_id, title: data.title, notes: data.user_notes, createdAt: data.created_at, updatedAt: data.updated_at },
      });
    }

    if (body.op === "note") {
      if (!body.videoRowId) return corsJson({ error: "Missing saved video." }, { status: 400 });
      const { data, error } = await admin
        .from("creatorlens_saved_videos")
        .update({ user_notes: body.notes ?? "", updated_at: new Date().toISOString() })
        .eq("id", body.videoRowId)
        .eq("license_id", licenseId)
        .select("id,youtube_video_id,title,user_notes,updated_at")
        .maybeSingle();
      if (error) {
        const mapped = mappedError(error);
        return corsJson({ error: mapped.error }, { status: mapped.status });
      }
      if (!data) return corsJson({ error: "That saved video was not found." }, { status: 404 });
      return corsJson({ video: { id: data.id, videoId: data.youtube_video_id, title: data.title, notes: data.user_notes, updatedAt: data.updated_at } });
    }

    if (body.op === "unsave") {
      if (!body.videoRowId) return corsJson({ error: "Missing saved video." }, { status: 400 });
      const { data, error } = await admin
        .from("creatorlens_saved_videos")
        .delete()
        .eq("id", body.videoRowId)
        .eq("license_id", licenseId)
        .select("id")
        .maybeSingle();
      if (error) {
        const mapped = mappedError(error);
        return corsJson({ error: mapped.error }, { status: mapped.status });
      }
      if (!data) return corsJson({ error: "That saved video was not found." }, { status: 404 });
      return corsJson({ ok: true });
    }
  } catch {
    return corsJson({ error: "Could not update your library. Try again." }, { status: 500 });
  }

  return corsJson({ error: "Unknown library action." }, { status: 400 });
}
