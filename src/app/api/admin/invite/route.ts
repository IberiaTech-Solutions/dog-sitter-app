import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Verify admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, fullName, role } = await req.json();

  if (!email || !fullName || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!["owner", "sitter", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Invite user — Supabase sends the invite email automatically
  const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      role,
      locale: "es",
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
  });

  if (error) {
    if (error.message.includes("already")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    userId: data.user.id,
  });
}
