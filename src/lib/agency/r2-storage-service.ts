import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2BucketName } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FileCategory } from "@/types/agency";
import { logAgencyActivity } from "./activity-logger";

const bucketName = r2BucketName;

/**
 * Validates storage quota and generates a presigned PUT URL for direct browser-to-R2 upload.
 */
export async function createPresignedUploadUrl({
  workspaceId,
  projectId,
  fileName,
  fileSizeBytes,
  mimeType,
  category = "original",
}: {
  workspaceId: string;
  projectId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  category?: FileCategory;
}) {
  const adminClient = createAdminClient();

  // 1. Quota Check
  const { data: ws, error: wsErr } = await adminClient
    .from("workspaces")
    .select("storage_quota_bytes, storage_used_bytes")
    .eq("id", workspaceId)
    .single();

  if (wsErr || !ws) {
    throw new Error("Workspace not found.");
  }

  const currentUsed = Number(ws.storage_used_bytes || 0);
  const quota = Number(ws.storage_quota_bytes || 2147483648);

  if (currentUsed + fileSizeBytes > quota) {
    const availableMB = ((quota - currentUsed) / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Storage quota exceeded. You have ${availableMB} MB remaining. Upgrade your plan to upload larger files.`
    );
  }

  // 2. Generate clean, safe object key
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const r2Key = `agency/${workspaceId}/${projectId}/${category}/${timestamp}_${safeName}`;

  // 3. Generate Presigned PUT URL
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    ContentType: mimeType || "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 1800 }); // 30 minutes

  return {
    uploadUrl,
    r2Key,
    fileName: safeName,
    fileSizeBytes,
    mimeType,
    category,
  };
}

/**
 * Register the file in the database and increment workspace storage usage after upload finishes.
 */
export async function confirmUploadedFile({
  workspaceId,
  projectId,
  r2Key,
  fileName,
  fileSizeBytes,
  mimeType,
  category = "original",
  uploadedBy,
  uploaderName,
}: {
  workspaceId: string;
  projectId: string;
  r2Key: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  category?: FileCategory;
  uploadedBy?: string;
  uploaderName?: string;
}) {
  const adminClient = createAdminClient();

  // 1. Insert file record
  const { data: fileRecord, error: fileErr } = await adminClient
    .from("agency_project_files")
    .insert({
      workspace_id: workspaceId,
      project_id: projectId,
      file_name: fileName,
      r2_key: r2Key,
      file_size_bytes: fileSizeBytes,
      mime_type: mimeType,
      category,
      uploaded_by: uploadedBy || null,
    })
    .select("*")
    .single();

  if (fileErr || !fileRecord) {
    throw new Error(fileErr?.message || "Failed to register uploaded file.");
  }

  // 2. Increment storage used bytes on workspace
  const { data: ws } = await adminClient
    .from("workspaces")
    .select("storage_used_bytes")
    .eq("id", workspaceId)
    .single();

  const newTotal = Number(ws?.storage_used_bytes || 0) + fileSizeBytes;
  await adminClient
    .from("workspaces")
    .update({ storage_used_bytes: newTotal, updated_at: new Date().toISOString() })
    .eq("id", workspaceId);

  // 3. Log activity
  await logAgencyActivity({
    workspaceId,
    projectId,
    actorId: uploadedBy,
    actorName: uploaderName || "Creator",
    action: "file.uploaded",
    resourceType: "file",
    resourceId: fileRecord.id,
    details: { name: fileName, size: fileSizeBytes, category },
  });

  return fileRecord;
}

/**
 * Get secure signed download or stream URL for an R2 key.
 */
export async function getR2SignedReadUrl(r2Key: string, expiresIn = 3600) {
  // If custom domain is set and public, prefer clean URL
  const customDomain = process.env.R2_PUBLIC_DOMAIN;
  if (customDomain) {
    const cleanDomain = customDomain.replace(/\/$/, "");
    const cleanKey = r2Key.replace(/^\//, "");
    return `${cleanDomain}/${cleanKey}`;
  }

  // Otherwise generate short-lived signed GET URL
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Delete a file from Cloudflare R2 and decrement workspace storage quota.
 */
export async function deleteAgencyFile(fileId: string, workspaceId: string) {
  const adminClient = createAdminClient();

  const { data: file } = await adminClient
    .from("agency_project_files")
    .select("*")
    .eq("id", fileId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!file) {
    throw new Error("File not found or permission denied.");
  }

  // 1. Delete from R2
  try {
    const deleteCmd = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: file.r2_key,
    });
    await r2Client.send(deleteCmd);
  } catch (err) {
    console.warn("Could not delete object from R2 directly:", err);
  }

  // 2. Delete database record
  await adminClient.from("agency_project_files").delete().eq("id", fileId);

  // 3. Decrement storage_used_bytes
  const { data: ws } = await adminClient
    .from("workspaces")
    .select("storage_used_bytes")
    .eq("id", workspaceId)
    .single();

  const newTotal = Math.max(0, Number(ws?.storage_used_bytes || 0) - Number(file.file_size_bytes));
  await adminClient
    .from("workspaces")
    .update({ storage_used_bytes: newTotal, updated_at: new Date().toISOString() })
    .eq("id", workspaceId);

  return { success: true };
}

