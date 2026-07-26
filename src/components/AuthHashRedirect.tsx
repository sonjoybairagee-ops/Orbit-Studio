"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && (hash.includes("access_token=") || hash.includes("type=recovery") || hash.includes("type=signup"))) {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push("/dashboard?welcome=true");
          router.refresh();
        } else {
          // If hash contains token, parsing happens via Supabase auth state change
          const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
              router.push("/dashboard?welcome=true");
              router.refresh();
            }
          });
          return () => listener.subscription.unsubscribe();
        }
      });
    }
  }, [router]);

  return null;
}
