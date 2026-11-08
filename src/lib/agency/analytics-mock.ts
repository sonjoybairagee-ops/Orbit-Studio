/**
 * CompX Orbit Agency OS — Analytics MOCK DATA (DESIGN PREVIEW ONLY)
 *
 * ⚠️  Every value in this module is synthetic sample data used to render the
 *     Analytics Dashboard UI while it is in UI-only phase. None of it comes
 *     from the database. It MUST NOT be presented to users as verified fact.
 *
 * Real integration points (for a later phase — validate each schema first):
 *   - workspace_storage_ledger_v2     (storage growth history)
 *   - workspaces.storage_*            (quota / used / reserved snapshot)
 *   - agency_project_files            (file counts, largest files; NOTE: no
 *                                      mime/category column yet — type must be
 *                                      derived from r2_key extension)
 *   - workspace_upload_reservations   (pending / expired reservations)
 *   - storage_cleanup_outbox / registry (job monitoring; dead_letter semantics
 *                                      per v3.14 worker design)
 *   - agency_projects                 (status counts, completion)
 *   - agency_activity_logs            (team activity timeline)
 */

export interface GrowthPoint {
  date: string; // ISO date
  usedBytes: number;
  reservedBytes: number;
}

export interface KpiKeyCount {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dead_letter: number;
}

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

/** Total quota shown in the preview (512 GB, "pro" plan). */
export const MOCK_QUOTA_BYTES = 512 * GB;
export const MOCK_USED_BYTES = 184.2 * GB;
export const MOCK_RESERVED_BYTES = 12.4 * GB;
export const MOCK_FILE_TOTAL = 1482;
export const MOCK_FILE_RECENT_7D = 23;
export const MOCK_FILE_CHANGE_PCT = 12.4;
export const MOCK_ACTIVE_MEMBERS = 9;
export const MOCK_TEAM_SIZE = 12;

/** Deterministic daily growth series for the last `days` days (no randomness). */
export function buildMockGrowthSeries(days: number): GrowthPoint[] {
  const points: GrowthPoint[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start.getTime() - i * 86400000);
    const t = (days - 1 - i) / Math.max(days - 1, 1); // 0 → 1
    // climb from ~95 GB to 184 GB with a gentle weekly rhythm
    const drift = 88.9 + t * 95.3 + Math.sin(i * 0.9) * 2.1;
    const used = Math.round(drift * GB);
    const reserved = Math.round((0.5 + ((i * 7) % 11) * 0.4) * GB);
    points.push({
      date: d.toISOString().slice(0, 10),
      usedBytes: used,
      reservedBytes: reserved,
    });
  }
  return points;
}

export const MOCK_TEMPLATE_GROWTH = buildMockGrowthSeries(365);

export const MOCK_STORAGE_SPLIT = {
  usedBytes: MOCK_USED_BYTES,
  reservedBytes: MOCK_RESERVED_BYTES,
  quotaBytes: MOCK_QUOTA_BYTES,
};

export const MOCK_STORAGE_BY_PROJECT = [
  { projectId: "p1", projectName: "Nike Q4 Campaign Film", bytes: 58.4 * GB, files: 412 },
  { projectId: "p2", projectName: "Cravity Music Video", bytes: 41.2 * GB, files: 238 },
  { projectId: "p3", projectName: "Seedbank Recut", bytes: 27.8 * GB, files: 154 },
  { projectId: "p4", projectName: "Turbine Sizzle", bytes: 18.6 * GB, files: 96 },
  { projectId: "p5", projectName: "Harbor Docs Edit", bytes: 12.1 * GB, files: 148 },
  { projectId: "p6", projectName: "Frostbite Teaser", bytes: 9.7 * GB, files: 71 },
  { projectId: "p7", projectName: "Momentum Ads", bytes: 7.4 * GB, files: 58 },
  { projectId: "p8", projectName: "Archive 2025", bytes: 4.9 * GB, files: 214 },
];

export const MOCK_CATEGORY_DISTRIBUTION = [
  { category: "original", label: "Originals", bytes: 96.3 * GB, pct: 52.3 },
  { category: "deliverable", label: "Deliverables", bytes: 41.7 * GB, pct: 22.6 },
  { category: "preview", label: "Previews", bytes: 22.9 * GB, pct: 12.4 },
  { category: "revision", label: "Revisions", bytes: 14.2 * GB, pct: 7.7 },
  { category: "image", label: "Stills", bytes: 5.8 * GB, pct: 3.1 },
  { category: "document", label: "Documents", bytes: 2.6 * GB, pct: 1.4 },
  { category: "audio", label: "Audio", bytes: 0.7 * GB, pct: 0.5 },
];

export const MOCK_FILE_TYPE_DISTRIBUTION = [
  { ext: "mp4", count: 608, pct: 41.0 },
  { ext: "mov", count: 326, pct: 22.0 },
  { ext: "wav", count: 178, pct: 12.0 },
  { ext: "psd", count: 147, pct: 9.9 },
  { ext: "ai", count: 89, pct: 6.0 },
  { ext: "pdf", count: 52, pct: 3.5 },
  { ext: "zip", count: 31, pct: 2.1 },
  { ext: "other", count: 51, pct: 3.5 },
];

export interface MockLargestFile {
  id: string;
  fileName: string;
  project: string;
  sizeBytes: number;
  uploadedAt: string;
  uploader: string;
}

export const MOCK_LARGEST_FILES: MockLargestFile[] = [
  { id: "f1", fileName: "nike_q4_master_8k.mov", project: "Nike Q4 Campaign Film", sizeBytes: 12.8 * GB, uploadedAt: "2026-10-30", uploader: "Arif Rahman" },
  { id: "f2", fileName: "cravity_mv_final_print.prores", project: "Cravity Music Video", sizeBytes: 9.4 * GB, uploadedAt: "2026-10-28", uploader: "Nusrat Jahan" },
  { id: "f3", fileName: "turbine_sizzle_v3_5k.mp4", project: "Turbine Sizzle", sizeBytes: 7.2 * GB, uploadedAt: "2026-10-24", uploader: "Arif Rahman" },
  { id: "f4", fileName: "seedbank_recut_raw_bundle.zip", project: "Seedbank Recut", sizeBytes: 6.1 * GB, uploadedAt: "2026-10-22", uploader: "Md. Tanvir" },
  { id: "f5", fileName: "harbor_docs_interviews_raw.mp4", project: "Harbor Docs Edit", sizeBytes: 5.7 * GB, uploadedAt: "2026-10-18", uploader: "Sadia Karim" },
  { id: "f6", fileName: "frostbite_teaser_audio_mux.wav", project: "Frostbite Teaser", sizeBytes: 4.3 * GB, uploadedAt: "2026-10-15", uploader: "Nusrat Jahan" },
  { id: "f7", fileName: "momentum_ads_batch_03.zip", project: "Momentum Ads", sizeBytes: 3.8 * GB, uploadedAt: "2026-10-11", uploader: "Md. Tanvir" },
  { id: "f8", fileName: "archive_2025_masters.tar", project: "Archive 2025", sizeBytes: 3.1 * GB, uploadedAt: "2026-09-30", uploader: "Arif Rahman" },
];

export interface MockProjectPerf {
  id: string;
  name: string;
  client: string;
  status: "in_progress" | "internal_review" | "client_review" | "approved" | "delivered" | "archived" | "planning" | "revision_required";
  sizeBytes: number;
  progressPct: number;
  lastActivity: string;
  overdue: boolean;
}

export const MOCK_PROJECT_STATUS_COUNTS = {
  planning: 3,
  in_progress: 11,
  internal_review: 2,
  client_review: 2,
  revision_required: 1,
  approved: 3,
  delivered: 27,
  archived: 5,
};

export const MOCK_PROJECT_COMPLETION_BY_MONTH = [
  { month: "Nov '25", delivered: 1 },
  { month: "Dec '25", delivered: 2 },
  { month: "Jan '26", delivered: 2 },
  { month: "Feb '26", delivered: 3 },
  { month: "Mar '26", delivered: 2 },
  { month: "Apr '26", delivered: 4 },
  { month: "May '26", delivered: 3 },
  { month: "Jun '26", delivered: 2 },
  { month: "Jul '26", delivered: 4 },
  { month: "Aug '26", delivered: 1 },
  { month: "Sep '26", delivered: 2 },
  { month: "Oct '26", delivered: 3 },
];

export const MOCK_PROJECT_PERFORMANCE: MockProjectPerf[] = [
  { id: "p1", name: "Nike Q4 Campaign Film", client: "Nike BD", status: "in_progress", sizeBytes: 58.4 * GB, progressPct: 68, lastActivity: "2026-11-03", overdue: false },
  { id: "p2", name: "Cravity Music Video", client: "Cravity Mgmt", status: "client_review", sizeBytes: 41.2 * GB, progressPct: 85, lastActivity: "2026-11-02", overdue: false },
  { id: "p3", name: "Seedbank Recut", client: "Seedbank", status: "revision_required", sizeBytes: 27.8 * GB, progressPct: 74, lastActivity: "2026-10-31", overdue: true },
  { id: "p4", name: "Turbine Sizzle", client: "Turbine Inc", status: "internal_review", sizeBytes: 18.6 * GB, progressPct: 90, lastActivity: "2026-10-29", overdue: false },
  { id: "p5", name: "Harbor Docs Edit", client: "Harbor Media", status: "approved", sizeBytes: 12.1 * GB, progressPct: 100, lastActivity: "2026-10-27", overdue: false },
  { id: "p6", name: "Frostbite Teaser", client: "Frostbite Studio", status: "in_progress", sizeBytes: 9.7 * GB, progressPct: 45, lastActivity: "2026-10-20", overdue: true },
  { id: "p7", name: "Momentum Ads", client: "Momentum", status: "delivered", sizeBytes: 7.4 * GB, progressPct: 100, lastActivity: "2026-10-12", overdue: false },
  { id: "p8", name: "Archive 2025", client: "Internal", status: "archived", sizeBytes: 4.9 * GB, progressPct: 100, lastActivity: "2026-09-30", overdue: false },
];

export interface MockTeamMember {
  id: string;
  name: string;
  role: string;
  uploads: number;
  actions: number;
  lastActive: string;
}

export const MOCK_TEAM_ACTIVITY: MockTeamMember[] = [
  { id: "m1", name: "Arif Rahman", role: "editor", uploads: 148, actions: 402, lastActive: "2026-11-03" },
  { id: "m2", name: "Nusrat Jahan", role: "editor", uploads: 96, actions: 287, lastActive: "2026-11-03" },
  { id: "m3", name: "Md. Tanvir", role: "admin", uploads: 71, actions: 244, lastActive: "2026-11-02" },
  { id: "m4", name: "Sadia Karim", role: "reviewer", uploads: 54, actions: 176, lastActive: "2026-11-02" },
  { id: "m5", name: "Rakib Hasan", role: "editor", uploads: 38, actions: 121, lastActive: "2026-10-31" },
  { id: "m6", name: "Owner (you)", role: "owner", uploads: 12, actions: 88, lastActive: "2026-11-04" },
];

export type ActivityAction =
  | "upload"
  | "delete"
  | "project_created"
  | "delivery"
  | "revision"
  | "comment";

export interface MockActivityEvent {
  id: string;
  action: ActivityAction;
  actor: string;
  target: string;
  at: string; // ISO datetime
}

export const MOCK_RECENT_ACTIVITY: MockActivityEvent[] = [
  { id: "a1", action: "upload", actor: "Arif Rahman", target: "nike_q4_v12_locator.mp4 → Nike Q4", at: "2026-11-03T17:42:00Z" },
  { id: "a2", action: "delivery", actor: "Md. Tanvir", target: "Cravity MV → Client review sent", at: "2026-11-02T15:10:00Z" },
  { id: "a3", action: "revision", actor: "Sadia Karim", target: "Seedbank Recut → 2 change requests", at: "2026-10-31T11:25:00Z" },
  { id: "a4", action: "upload", actor: "Nusrat Jahan", target: "cravity_print_4k.prores → Cravity", at: "2026-10-30T09:05:00Z" },
  { id: "a5", action: "project_created", actor: "Owner (you)", target: "Momentum Ads Batch 4", at: "2026-10-28T14:00:00Z" },
  { id: "a6", action: "comment", actor: "Rakib Hasan", target: "Turbine Sizzle v3 → 4 markers", at: "2026-10-27T18:20:00Z" },
  { id: "a7", action: "delete", actor: "Owner (you)", target: "wip_renders_tmp/ (9 previews)", at: "2026-10-25T10:12:00Z" },
  { id: "a8", action: "delivery", actor: "Md. Tanvir", target: "Frostbite Teaser → approved", at: "2026-10-24T16:44:00Z" },
];

/** Storage operations monitoring — mirrors the v3.14 worker semantics. */
export const MOCK_CLEANUP_COUNTS: KpiKeyCount = {
  pending: 3,
  processing: 1,
  completed: 412,
  failed: 2,
  dead_letter: 0,
};

export interface MockCleanupJob {
  id: string;
  r2Key: string;
  kind: "orphan" | "delete_file" | "expire_reservation";
  status: "pending" | "processing" | "completed" | "failed" | "dead_letter";
  attempts: number;
  queuedAt: string;
  lastTouchedAt: string;
  note?: string;
}

export const MOCK_CLEANUP_JOBS: MockCleanupJob[] = [
  { id: "j-8812", r2Key: "stg/ws-44/p21/tmp_render_l13.bin", kind: "expire_reservation", status: "processing", attempts: 2, queuedAt: "2026-11-03T21:00:00Z", lastTouchedAt: "2026-11-04T02:12:00Z" },
  { id: "j-8811", r2Key: "stg/ws-44/p31/late_upload.wav", kind: "expire_reservation", status: "pending", attempts: 0, queuedAt: "2026-11-04T03:40:00Z", lastTouchedAt: "—" },
  { id: "j-8810", r2Key: "stg/ws-44/p07/aborted_take.mov", kind: "expire_reservation", status: "pending", attempts: 0, queuedAt: "2026-11-04T03:12:00Z", lastTouchedAt: "—" },
  { id: "j-8809", r2Key: "del/ws-44/p15/old_master_8k.mov", kind: "delete_file", status: "pending", attempts: 1, queuedAt: "2026-11-03T19:55:00Z", lastTouchedAt: "2026-11-03T19:55:00Z", note: "lease expired once — retried" },
  { id: "j-8793", r2Key: "del/ws-44/p09/wrong_cut.prores", kind: "delete_file", status: "failed", attempts: 3, queuedAt: "2026-11-02T09:30:00Z", lastTouchedAt: "2026-11-02T21:10:00Z", note: "backoff waiting for next sweep" },
  { id: "j-8770", r2Key: "stg/ws-44/p12/tmp_0912.bin", kind: "orphan", status: "failed", attempts: 2, queuedAt: "2026-11-01T04:00:00Z", lastTouchedAt: "2026-11-03T04:00:00Z", note: "R2 DeleteObjects partial" },
];

export const MOCK_RESERVATION_COUNTS = {
  pending: 4,
  expired: 17,
  cancelled: 6,
};

export interface MockReservation {
  id: string;
  r2Key: string;
  reservedBytes: number;
  status: "pending" | "expired" | "cancelled" | "confirmed";
  createdAt: string;
  expiresAt: string;
}

export const MOCK_RESERVATIONS: MockReservation[] = [
  { id: "r-5021", r2Key: "stg/ws-44/p01/crush_final_v2.mov", reservedBytes: 6.2 * GB, status: "pending", createdAt: "2026-11-04T01:05:00Z", expiresAt: "2026-11-04T04:05:00Z" },
  { id: "r-5020", r2Key: "stg/ws-44/p22/voice_ag_then.mp3", reservedBytes: 340 * MB, status: "pending", createdAt: "2026-11-04T02:44:00Z", expiresAt: "2026-11-04T05:44:00Z" },
  { id: "r-5019", r2Key: "stg/ws-44/p18/thumbs_seq.zip", reservedBytes: 1.1 * GB, status: "expired", createdAt: "2026-11-03T14:20:00Z", expiresAt: "2026-11-03T17:20:00Z" },
  { id: "r-5018", r2Key: "stg/ws-44/p06/bumper_4k.mov", reservedBytes: 3.9 * GB, status: "cancelled", createdAt: "2026-11-03T10:02:00Z", expiresAt: "2026-11-03T13:02:00Z" },
];

/**
 * Section provenance labels — rendered as fine-print under each panel so the
 * preview can never be mistaken for live data.
 */
export const MOCK_SECTION_NOTE =
  "Sample data for design preview — not yet connected to live workspace records.";
