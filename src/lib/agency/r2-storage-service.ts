/**
 * Agency OS R2 Storage Service
 *
 * Security model:
 *  - All quota logic delegated to Postgres functions (atomic, race-condition-safe).
 *  - R2 keys are always generated server-side (never trusted from client input).
 *  - All mutations use the admin (service-role) Supabase client.
 *  - compx-assets extension bucket is never touched here.
 */

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { agencyR2Client, agencyBucketName } from "./agency-r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { FileCategory } from "@/types/agency";
import { logAgencyActivity } from "./activity-logger";

const bucketName = agencyBucketName;

// ---------------------------------------------------------------------------
// UPLOAD — Step 1: Reserve quota and return presigned PUT URL
// ---------------------------------------------------------------------------

/**
 * Atomically reserves storage quota via Postgres RPC and returns a presigned
 * PUT URL for direct browser-to-R2 upload.
 *
 * Security:
 *  - Calls agency_reserve_upload_bytes() which:
 *      • Verifies project_id belongs to workspace_id
 *      • Locks workspace row to prevent concurrent over-quota
 *      • Creates reservation record with unique r2_key constraint
 *  - R2 key is always generated server-side.
 *  - Returns reservation_id so the confirm step can verify the upload.
 */
export async function createPresignedUploadUrl({
  workspaceId,
  projectId,
  userId,
  fileName,
  fileSizeBytes,
  mimeType,
  category = "original",
}: {
  workspaceId: string;
  projectId: string;
  userId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  category?: FileCategory;
}) {
  const adminClient = createAdminClient();

  // Generate server-side R2 key — never accept from client
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const r2Key = `agency/${workspaceId}/${projectId}/${category}/${timestamp}_${safeName}`;

  // Atomic quota reservation via Postgres function
  const { data: reservationId, error: rpcError } = await adminClient.rpc(
    "agency_reserve_upload_bytes",
    {
      p_workspace_id:   workspaceId,
      p_project_id:     projectId,
      p_r2_key:         r2Key,
      p_reserved_bytes: fileSizeBytes,
      p_mime_type:      mimeType,
      p_category:       category,
      p_actor_id:       userId,
    }
  );

  if (rpcError || !reservationId) {
    throw new Error(rpcError?.message || "Storage quota reservation failed.");
  }

  // Generate presigned PUT URL (35-minute window, matches reservation expiry)
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    ContentType: mimeType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(agencyR2Client, command, { expiresIn: 2100 }); // 35 min

  return {
    uploadUrl,
    r2Key,
    reservationId: reservationId as string,
    fileName: safeName,
    fileSizeBytes,
    mimeType,
    category,
  };
}

// ---------------------------------------------------------------------------
// UPLOAD — Step 2: Confirm after browser upload finishes
// ---------------------------------------------------------------------------

/**
 * Atomically confirms a pending reservation:
 *  - Locks reservation row (prevents duplicate confirms)
 *  - Verifies reservation is pending and not expired
 *  - Inserts agency_project_files record
 *  - Adjusts workspace reserved_bytes / storage_used_bytes atomically
 *  - Appends ledger entry
 *
 * Security:
 *  - r2Key is NOT accepted from client — looked up from reservation record.
 *  - Idempotent: if already confirmed returns existing file record.
 */
export async function confirmUploadedFile({
  reservationId,
  actualFileSizeBytes,
  fileName,
  userId,
  uploaderName,
  workspaceId,
  projectId,
}: {
  reservationId: string;
  actualFileSizeBytes: number;
  fileName: string;
  userId?: string;
  uploaderName?: string;
  workspaceId: string;
  projectId: string;
}) {
  const adminClient = createAdminClient();

  // Atomic confirm via Postgres function
  const { data: fileId, error: rpcError } = await adminClient.rpc(
    "agency_confirm_upload",
    {
      p_reservation_id: reservationId,
      p_actual_bytes:   actualFileSizeBytes,
      p_file_name:      fileName,
      p_actor_id:       userId || null,
      p_uploader_name:  uploaderName || "Creator",
    }
  );

  if (rpcError || !fileId) {
    throw new Error(rpcError?.message || "Failed to confirm upload.");
  }

  // Fetch the created file record for the response
  const { data: fileRecord } = await adminClient
    .from("agency_project_files")
    .select("*")
    .eq("id", fileId)
    .single();

  // Log activity (non-critical — don't throw if it fails)
  await logAgencyActivity({
    workspaceId,
    projectId,
    actorId: userId,
    actorName: uploaderName || "Creator",
    action: "file.uploaded",
    resourceType: "file",
    resourceId: fileId as string,
    details: { name: fileName, size: actualFileSizeBytes },
  }).catch(() => {});

  return fileRecord;
}

// ---------------------------------------------------------------------------
// UPLOAD — Cancel / Fail a reservation explicitly
// ---------------------------------------------------------------------------

/**
 * Release a pending reservation (e.g., user cancelled upload mid-way).
 * Safe to call multiple times — idempotent.
 */
export async function cancelUploadReservation(reservationId: string, reason: "cancelled" | "failed" = "cancelled") {
  const adminClient = createAdminClient();

  const { error } = await adminClient.rpc("agency_release_reservation", {
    p_reservation_id: reservationId,
    p_reason:         reason,
  });

  if (error) {
    console.warn("agency_release_reservation error (non-fatal):", error.message);
  }
}

// ---------------------------------------------------------------------------
// READ — Signed download URL
// ---------------------------------------------------------------------------

/**
 * Get a short-lived signed GET URL for an R2 key.
 * Prefer AGENCY_R2_PUBLIC_DOMAIN if configured (e.g., Cloudflare custom domain).
 */
export async function getR2SignedReadUrl(r2Key: string, expiresIn = 3600) {
  const customDomain = process.env.AGENCY_R2_PUBLIC_DOMAIN;
  if (customDomain) {
    const cleanDomain = customDomain.replace(/\/$/, "");
    const cleanKey = r2Key.replace(/^\//, "");
    return `${cleanDomain}/${cleanKey}`;
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
  });

  return await getSignedUrl(agencyR2Client, command, { expiresIn });
}

// ---------------------------------------------------------------------------
// DELETE — Atomic file deletion
// ---------------------------------------------------------------------------

/**
 * Atomically deletes a file:
 *  1. Calls agency_delete_file_atomic() which:
 *       • Verifies file belongs to workspace
 *       • Deletes DB record
 *       • Decrements storage_used_bytes atomically
 *       • Appends ledger entry
 *  2. Deletes the R2 object (best-effort — DB is the source of truth)
 *
 * Security:
 *  - workspace_id is verified inside the Postgres function.
 *  - File ownership check prevents cross-workspace deletion.
 */
export async function deleteAgencyFile(fileId: string, workspaceId: string, userId?: string) {
  const adminClient = createAdminClient();

  // Fetch r2_key before deleting (needed for R2 deletion)
  const { data: file, error: fetchErr } = await adminClient
    .from("agency_project_files")
    .select("r2_key, file_name, file_size_bytes, project_id")
    .eq("id", fileId)
    .eq("workspace_id", workspaceId)
    .single();

  if (fetchErr || !file) {
    throw new Error("File not found or permission denied.");
  }

  // Atomic DB deletion + storage_used_bytes decrement via Postgres function
  const { error: rpcError } = await adminClient.rpc("agency_delete_file_atomic", {
    p_file_id:      fileId,
    p_workspace_id: workspaceId,
    p_actor_id:     userId || null,
  });

  if (rpcError) {
    throw new Error(rpcError.message || "Failed to delete file record.");
  }

  // Best-effort R2 object deletion (DB record already removed above)
  try {
    const deleteCmd = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: file.r2_key,
    });
    await agencyR2Client.send(deleteCmd);
  } catch (err) {
    console.warn("R2 object deletion failed (DB record already removed):", err);
  }

  // Log activity (non-critical)
  await logAgencyActivity({
    workspaceId,
    projectId: file.project_id,
    actorId: userId,
    actorName: "Creator",
    action: "file.deleted",
    resourceType: "file",
    resourceId: fileId,
    details: { name: file.file_name, size: file.file_size_bytes },
  }).catch(() => {});

  return { success: true };
}
