"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    const supabase = createClient();

    // Supabase client auto-detects the hash and sets the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Clear the hash
        window.history.replaceState(null, "", window.location.pathname);
        router.push("/dashboard");
        router.refresh();
      }
    });
  }, [router]);

  return null;
}
