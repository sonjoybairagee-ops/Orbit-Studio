"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export function InviteAcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleAccept = async () => {
    setIsAccepting(true);
    setError("");

    try {
      const res = await fetch("/api/agency/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation.");
      }

      router.push("/dashboard/agency");
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation.");
      setIsAccepting(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleAccept}
        disabled={isAccepting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3cff5f] py-3 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-lg shadow-[#3cff5f]/20 cursor-pointer disabled:opacity-50"
      >
        {isAccepting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Joining Workspace...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>Accept Invitation &amp; Open Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

