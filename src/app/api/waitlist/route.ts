import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const barrio = typeof body.barrio === "string" ? body.barrio.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("waitlist").insert({
      email,
      barrio: barrio || null,
      user_agent: request.headers.get("user-agent") ?? null,
    });

    // Duplicates (unique index collision) are treated as success — user is already on the list.
    if (error && error.code !== "23505") {
      console.error("[waitlist] insert error:", error.message);
      return NextResponse.json({ error: "save_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
