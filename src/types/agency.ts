export type WorkspaceRole = "owner" | "admin" | "editor" | "reviewer" | "client";

export type WorkspacePlanTier = "free" | "starter" | "pro" | "agency";

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "internal_review"
  | "client_review"
  | "revision_required"
  | "approved"
  | "delivered"
  | "archived";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type ClientStatus = "active" | "lead" | "archived" | "paused";

export type FileCategory =
  | "original"
  | "preview"
  | "revision"
  | "deliverable"
  | "image"
  | "audio"
  | "document";

export type VersionStatus = "draft" | "review_ready" | "revision_needed" | "approved";

export type DeliveryStatus = "pending_review" | "approved" | "rejected" | "downloaded";

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  plan_tier: WorkspacePlanTier;
  storage_quota_bytes: number;
  storage_used_bytes: number;
  reserved_bytes?: number;
  is_over_quota?: boolean;
  settings?: {
    currency?: string;
    brandColor?: string;
    clientPortalBanner?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  profiles?: {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string;
  };
}

export interface AgencyClient {
  id: string;
  workspace_id: string;
  name: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  notes?: string | null;
  status: ClientStatus;
  portal_token: string;
  created_at: string;
  updated_at: string;
  project_count?: number;
}

export interface AgencyProject {
  id: string;
  workspace_id: string;
  client_id?: string | null;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline?: string | null;
  cover_url?: string | null;
  budget?: number | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  agency_clients?: {
    id: string;
    name: string;
    company: string;
  } | null;
  file_count?: number;
  version_count?: number;
  unresolved_comment_count?: number;
}

export interface AgencyProjectFile {
  id: string;
  workspace_id: string;
  project_id: string;
  folder_path: string;
  category: FileCategory;
  file_name: string;
  r2_key: string;
  file_size_bytes: number;
  mime_type: string;
  version_number: number;
  uploaded_by?: string | null;
  created_at: string;
  download_url?: string;
}

export interface AgencyVideoVersion {
  id: string;
  project_id: string;
  version_label: string;
  version_number: number;
  video_file_id?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  duration_seconds: number;
  status: VersionStatus;
  changelog: string;
  created_by?: string | null;
  created_at: string;
  comments?: AgencyVideoComment[];
}

export interface AgencyVideoComment {
  id: string;
  version_id: string;
  project_id: string;
  author_id?: string | null;
  author_name: string;
  author_email?: string | null;
  timestamp_seconds: number;
  comment_text: string;
  is_resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  replies?: AgencyVideoComment[];
}

export interface AgencyDelivery {
  id: string;
  project_id: string;
  client_id?: string | null;
  delivery_title: string;
  share_token: string;
  status: DeliveryStatus;
  files_payload: Array<{
    name: string;
    r2_key: string;
    size: number;
    mime: string;
  }>;
  expires_at: string;
  approved_at?: string | null;
  approved_by_name?: string | null;
  download_count: number;
  created_at: string;
}

export interface AgencyActivityLog {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  actor_id?: string | null;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  details?: Record<string, any>;
  created_at: string;
}

export interface AgencyDashboardStats {
  activeProjectsCount: number;
  totalClientsCount: number;
  pendingReviewsCount: number;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  recentProjects: AgencyProject[];
  recentActivity: AgencyActivityLog[];
}

export interface WorkspaceUploadReservation {
  id: string;
  workspace_id: string;
  project_id: string;
  r2_key: string;
  reserved_bytes: number;
  mime_type?: string | null;
  category: FileCategory;
  status: "pending" | "confirmed" | "expired" | "cancelled" | "failed";
  reserved_by?: string | null;
  expires_at: string;
  resolved_at?: string | null;
  created_at: string;
}

export interface WorkspaceStorageAddon {
  id: string;
  workspace_id: string;
  addon_id: string;
  bytes_added: number;
  status: "active" | "cancelled" | "expired";
  billing_cycle: "monthly" | "annual" | "one_time";
  payment_ref?: string | null;
  activated_at: string;
  expires_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
}

export interface WorkspaceStorageTransaction {
  id: string;
  workspace_id: string;
  event_type:
    | "upload_reserved"
    | "upload_confirmed"
    | "upload_cancelled"
    | "upload_expired"
    | "upload_failed"
    | "file_deleted"
    | "quota_upgraded"
    | "addon_activated"
    | "addon_cancelled";
  delta_bytes: number;
  balance_after: number;
  reservation_id?: string | null;
  file_id?: string | null;
  addon_id?: string | null;
  actor_id?: string | null;
  note?: string | null;
  created_at: string;
}


