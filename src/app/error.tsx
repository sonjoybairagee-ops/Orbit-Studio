"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the hosting provider logs without exposing details to users.
    console.error(error);
  }, [error]);

  return (
    <div className="shell grid min-h-[70vh] place-items-center py-16 text-center">
      <div className="max-w-[520px]">
        <p className="eyebrow">Something broke</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          That did not load properly.
        </h1>
        <p className="muted mt-4 leading-7">
          The problem is on our side, not yours. Try again in a moment. If it
          keeps happening, email support@compxorbit.com and mention the code
          below.
        </p>
        {error.digest && (
          <code className="mt-4 block font-mono text-xs text-[#8da096]">
            {error.digest}
          </code>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
