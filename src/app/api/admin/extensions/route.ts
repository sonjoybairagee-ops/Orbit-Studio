import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
const schema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  latestVersion: z.string().optional(),
  filePath: z.string().optional(),
});
export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = schema.safeParse(await req.json());
  if (!p.success)
    return NextResponse.json(
      { error: "Use a lowercase slug with letters, numbers and hyphens." },
      { status: 400 },
    );
  const s = createAdminClient();
  const { data, error } = await s
    .from("extensions")
    .insert({
      name: p.data.name,
      slug: p.data.slug,
      description: p.data.description || null,
      latest_version: p.data.latestVersion || "1.0.0",
      file_path: p.data.filePath || null,
      is_active: true,
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ extension: data });
}
