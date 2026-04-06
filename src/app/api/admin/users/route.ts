import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

async function requireAdminApi(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return null;
  return user;
}

// PATCH — update user role
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const admin = await requireAdminApi(supabase);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId, role } = await req.json();
  if (!userId || !role || !["owner", "sitter", "both", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Use service role to bypass "no role change" RLS policy
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await serviceClient
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — delete user (profile + auth user)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const admin = await requireAdminApi(supabase);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  // Prevent self-deletion
  if (userId === admin.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  // Use service role to bypass RLS for cascading deletes
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete profile (cascades to all related tables via ON DELETE CASCADE)
  const { error: profileError } = await serviceClient
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  // Delete auth user
  const { error: authError } = await serviceClient.auth.admin.deleteUser(userId);
  if (authError) {
    console.error("Failed to delete auth user:", authError);
  }

  return NextResponse.json({ ok: true });
}
