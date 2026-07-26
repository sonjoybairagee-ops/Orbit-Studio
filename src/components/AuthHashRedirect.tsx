"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      const targetPath = type === "recovery" ? "/reset-password" : "/dashboard";

      if (accessToken && refreshToken) {
        const supabase = createClient();
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(() => {
          window.location.href = targetPath;
        });
      } else {
        window.location.href = targetPath;
      }
    }
  }, []);

  return null;
}
