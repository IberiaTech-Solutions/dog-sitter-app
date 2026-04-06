import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { sendPushToUser } from "@/lib/push";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { booking_id } = await request.json();

  if (!booking_id) {
    return NextResponse.json({ error: "Missing booking_id" }, { status: 400 });
  }

  // Fetch booking — must belong to this sitter and be in "requested" status
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", booking_id)
    .eq("sitter_id", user.id)
    .eq("status", "requested")
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Find the payment to refund
  const { data: payment } = await supabase
    .from("payments")
    .select("stripe_payment_intent_id")
    .eq("booking_id", booking_id)
    .eq("status", "completed")
    .single();

  // Refund via Stripe if payment exists
  if (payment?.stripe_payment_intent_id) {
    const stripe = getStripe();
    await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
    });

    await supabase
      .from("payments")
      .update({ status: "refunded" })
      .eq("booking_id", booking_id);
  }

  // Cancel the booking
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", booking_id);

  // Audit log
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "booking.declined_and_refunded",
    resource_type: "booking",
    resource_id: booking_id,
    details: {
      refunded: !!payment?.stripe_payment_intent_id,
    },
  });

  // Notify owner
  sendPushToUser(booking.owner_id, {
    title: "Reserva cancelada",
    body: payment?.stripe_payment_intent_id
      ? "Tu reserva ha sido rechazada. El reembolso está en camino."
      : "Tu reserva ha sido rechazada.",
    url: "/es/dashboard",
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
