import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") ?? "es";
  const requestedRole = searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If this came from a sign-up flow with a role hint, apply it once.
      // We only set the role when the existing profile has the default ("owner")
      // and the requested role is recognized — never overwrite an established role.
      if (requestedRole === "owner" || requestedRole === "sitter") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profile?.role === "owner" && requestedRole === "sitter") {
            await supabase.from("profiles").update({ role: "sitter" }).eq("id", user.id);
          }
        }
      }
      return NextResponse.redirect(`${origin}/${locale}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
