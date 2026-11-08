"use client";

import { useState, useCallback, useRef } from "react";
import { AgencyProjectFile, FileCategory } from "@/types/agency";

export interface UploadQueueItem {
  id: string;
  file: File;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  category: FileCategory;
  workspaceId: string;
  projectId: string;
  progress: number;
  status:
    | "queued"
    | "reserving"
    | "uploading"
    | "confirming"
    | "completed"
    | "error"
    | "cancelled";
  error?: string;
  reservationId?: string;
  resultFile?: AgencyProjectFile;
  xhr?: XMLHttpRequest;
}

interface UseStorageUploadOptions {
  onFileUploaded?: (file: AgencyProjectFile) => void;
  onQueueComplete?: () => void;
}

export function useStorageUpload(options?: UseStorageUploadOptions) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const queueRef = useRef<UploadQueueItem[]>([]);
  queueRef.current = queue;

  const updateItem = useCallback(
    (id: string, updates: Partial<UploadQueueItem>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const processUploadItem = useCallback(
    async (item: UploadQueueItem) => {
      let currentReservationId = item.reservationId;

      try {
        // Step 1: Atomic Quota Reservation
        updateItem(item.id, { status: "reserving", progress: 5, error: undefined });

        const presignedRes = await fetch("/api/agency/storage/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: item.workspaceId,
            projectId: item.projectId,
            fileName: item.fileName,
            fileSizeBytes: item.fileSizeBytes,
            mimeType: item.mimeType,
            category: item.category,
          }),
        });

        const presignedData = await presignedRes.json();
        if (!presignedRes.ok) {
          throw new Error(presignedData.error || "Storage quota reservation failed.");
        }

        currentReservationId = presignedData.reservationId;
        updateItem(item.id, {
          reservationId: currentReservationId,
          status: "uploading",
          progress: 10,
        });

        // Step 2: Direct browser-to-R2 upload with XHR for real byte progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          updateItem(item.id, { xhr });

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.min(
                95,
                Math.round(10 + (event.loaded / event.total) * 80)
              );
              updateItem(item.id, { progress: percent });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`R2 upload rejected with HTTP status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during direct R2 upload"));
          xhr.onabort = () => reject(new Error("Upload aborted by user"));

          xhr.open("PUT", presignedData.uploadUrl, true);
          xhr.setRequestHeader(
            "Content-Type",
            item.mimeType || "application/octet-stream"
          );
          xhr.send(item.file);
        });

        // Step 3: Atomic confirmation & ledger registration
        updateItem(item.id, { status: "confirming", progress: 96 });

        const confirmRes = await fetch("/api/agency/storage/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: item.workspaceId,
            projectId: item.projectId,
            reservationId: currentReservationId,
            fileName: item.fileName,
            fileSizeBytes: item.fileSizeBytes,
            mimeType: item.mimeType,
          }),
        });

        const confirmData = await confirmRes.json();
        if (!confirmRes.ok || !confirmData.file) {
          throw new Error(confirmData.error || "Failed to confirm file registration.");
        }

        updateItem(item.id, {
          status: "completed",
          progress: 100,
          resultFile: confirmData.file,
          xhr: undefined,
        });

        if (options?.onFileUploaded) {
          options.onFileUploaded(confirmData.file);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";

        // If a reservation was created but upload/confirm aborted or failed, release it
        if (currentReservationId) {
          fetch("/api/agency/storage/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reservationId: currentReservationId,
              workspaceId: item.workspaceId,
            }),
          }).catch(() => {});
        }

        updateItem(item.id, {
          status: errorMsg.includes("aborted") ? "cancelled" : "error",
          error: errorMsg,
          xhr: undefined,
        });
      }
    },
    [updateItem, options]
  );

  const addFilesToQueue = useCallback(
    (
      files: File[],
      config: {
        workspaceId: string;
        projectId: string;
        category?: FileCategory;
      }
    ) => {
      const newItems: UploadQueueItem[] = files.map((file) => ({
        id: `upl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
        category: config.category || "original",
        workspaceId: config.workspaceId,
        projectId: config.projectId,
        progress: 0,
        status: "queued",
      }));

      setQueue((prev) => [...prev, ...newItems]);

      // Start processing each queued item
      for (const item of newItems) {
        processUploadItem(item);
      }
    },
    [processUploadItem]
  );

  const cancelUpload = useCallback(
    (itemId: string) => {
      const item = queueRef.current.find((q) => q.id === itemId);
      if (item && item.xhr) {
        item.xhr.abort();
      } else if (item && item.reservationId) {
        fetch("/api/agency/storage/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservationId: item.reservationId,
            workspaceId: item.workspaceId,
          }),
        }).catch(() => {});
        updateItem(itemId, { status: "cancelled" });
      }
    },
    [updateItem]
  );

  const retryUpload = useCallback(
    (itemId: string) => {
      const item = queueRef.current.find((q) => q.id === itemId);
      if (item) {
        processUploadItem(item);
      }
    },
    [processUploadItem]
  );

  const clearCompleted = useCallback(() => {
    setQueue((prev) =>
      prev.filter((item) => item.status !== "completed" && item.status !== "cancelled")
    );
  }, []);

  const isUploading = queue.some(
    (i) => i.status === "reserving" || i.status === "uploading" || i.status === "confirming"
  );

  return {
    queue,
    addFilesToQueue,
    cancelUpload,
    retryUpload,
    clearCompleted,
    isUploading,
  };
}

