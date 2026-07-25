"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LicenseAdminActionsProps {
  licenseId: string;
  status: string;
  maxDevices: number;
}

export function LicenseAdminActions({
  licenseId,
  status,
  maxDevices,
}: LicenseAdminActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState<string | null>(null);

  async function handleAction(action: string, extraMaxDevices?: number) {
    if (!reason || reason.trim().length < 3) {
      setError("Please provide a reason (at least 3 characters).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/license-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId,
          action,
          reason,
          maxDevices: extraMaxDevices,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed.");
      }

      setReason("");
      setShowReasonInput(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {error && <p className="w-full text-red-400">{error}</p>}

      {showReasonInput ? (
        <div className="flex w-full flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Reason for action..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input input-sm flex-1 text-xs"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => handleAction(showReasonInput)}
            disabled={loading}
            className="btn btn-sm btn-primary"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReasonInput(null);
              setError(null);
            }}
            disabled={loading}
            className="btn btn-sm btn-ghost"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowReasonInput("force_reset")}
            className="btn btn-xs btn-outline"
          >
            ⚡ Force Reset
          </button>

          {status === "active" && (
            <>
              <button
                type="button"
                onClick={() => setShowReasonInput("suspend")}
                className="btn btn-xs btn-warning"
              >
                Suspend
              </button>
              <button
                type="button"
                onClick={() => setShowReasonInput("revoke")}
                className="btn btn-xs btn-error"
              >
                Revoke
              </button>
            </>
          )}

          {(status === "suspended" || status === "revoked") && (
            <button
              type="button"
              onClick={() => setShowReasonInput("reactivate")}
              className="btn btn-xs btn-success"
            >
              Reactivate
            </button>
          )}
        </>
      )}
    </div>
  );
}
