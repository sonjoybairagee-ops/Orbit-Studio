import { FolderTree, HardDrive, Upload, Search, FileVideo, Music, Image as ImageIcon, FileText, Download } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AgencyFilesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);

  const usedMB = (workspace.storage_used_bytes / (1024 * 1024)).toFixed(0);
  const totalGB = (workspace.storage_quota_bytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <FolderTree className="h-6 w-6 text-[#3cff5f]" />
            <span>Cloudflare R2 File Explorer &amp; Assets</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Organized workspace bucket with secure direct uploads, raw footage, video cuts, and final client deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Direct Upload to R2</span>
          </button>
        </div>
      </div>

      {/* Storage Breakdown Banner */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#8da194] flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-[#3cff5f]" />
              <span>Workspace Storage Quota ({workspace.plan_tier.toUpperCase()})</span>
            </span>
            <span className="text-[#3cff5f] font-mono">{usedMB} MB / {totalGB} GB</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#1b2720] overflow-hidden">
            <div
              className="h-full bg-[#3cff5f] rounded-full transition-all"
              style={{ width: `${Math.max(2, (workspace.storage_used_bytes / workspace.storage_quota_bytes) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-[#8da194]">Cloudflare R2 Bucket:</span>
          <span className="rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-1 text-xs font-mono text-[#3cff5f]">
            compx-assets
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Video Renders", icon: FileVideo, count: "0 files", size: "0 MB" },
          { label: "Audio & SFX", icon: Music, count: "0 files", size: "0 MB" },
          { label: "Thumbnails & Images", icon: ImageIcon, count: "0 files", size: "0 MB" },
          { label: "Deliverables & Zips", icon: FileText, count: "0 files", size: "0 MB" },
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.label}
              className="rounded-2xl border border-[#213026] bg-[#0c1510] p-4 flex items-center gap-3.5 hover:border-[#3cff5f]/40 transition-all cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#e7eee9] truncate">{cat.label}</h4>
                <p className="text-[10px] text-[#62776a] mt-0.5">{cat.count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State / Dropper */}
      <div className="rounded-3xl border border-dashed border-[#213026] bg-[#0c1510]/40 p-12 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f]">
          <Upload className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#e7eee9]">
          Upload Media &amp; Project Files to R2
        </h3>
        <p className="text-xs text-[#8da194] max-w-sm mx-auto mt-1">
          Supports ProRes, MP4, MOV, WAV, PNG, and ZIP archives with multipart direct uploading and signed short-lived download links.
        </p>
      </div>
    </div>
  );
}

