import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { sitter_id, message, locale } = await request.json();

  if (!sitter_id) {
    return NextResponse.json({ error: "Missing sitter_id" }, { status: 400 });
  }

  // Verify sitter exists
  const { data: sitter } = await supabase
    .from("sitter_profiles")
    .select("id")
    .eq("id", sitter_id)
    .single();

  if (!sitter) {
    return NextResponse.json({ error: "Sitter not found" }, { status: 404 });
  }

  // Check for existing pending meet & greet with this sitter
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("owner_id", user.id)
    .eq("sitter_id", sitter_id)
    .eq("is_meet_greet", true)
    .in("status", ["meet_greet_requested", "meet_greet_accepted"])
    .single();

  if (existing) {
    return NextResponse.json(
      { error: locale === "es" ? "Ya tienes una cita pendiente con este cuidador" : "You already have a pending meet & greet with this sitter" },
      { status: 409 }
    );
  }

  // Create meet & greet booking (free — no payment)
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      owner_id: user.id,
      sitter_id,
      is_meet_greet: true,
      service_type: "meet_greet",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      daily_rate: 0,
      total_amount: 0,
      commission_amount: 0,
      commission_rate: 0,
      owner_notes: message?.trim() || null,
      status: "meet_greet_requested",
    })
    .select()
    .single();

  if (bookingError) {
    console.error("Meet & greet insert error:", bookingError);
    return NextResponse.json({ error: bookingError.message }, { status: 400 });
  }

  // Send a message to the sitter
  if (message?.trim()) {
    await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: sitter_id,
      content: message.trim(),
    });
  }

  // Notify sitter
  sendPushToUser(sitter_id, {
    title: locale === "es" ? "Nueva solicitud" : "New request",
    body: locale === "es" ? "Alguien quiere conocerte antes de reservar" : "Someone wants to meet you before booking",
    url: `/${locale}/dashboard`,
  }).catch(() => {});

  return NextResponse.json({ success: true, booking_id: booking.id });
}
