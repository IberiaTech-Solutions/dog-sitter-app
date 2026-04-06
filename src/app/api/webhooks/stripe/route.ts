import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push";
import Stripe from "stripe";

// Use service role client for webhooks (no user session)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      // Payment received — booking is now awaiting sitter acceptance
      await supabase
        .from("bookings")
        .update({ status: "requested" })
        .eq("id", bookingId);

      // Create payment record
      await supabase.from("payments").insert({
        booking_id: bookingId,
        payer_id: session.metadata?.owner_id,
        amount: (session.amount_total ?? 0) / 100,
        currency: "EUR",
        method: "stripe",
        stripe_payment_intent_id: session.payment_intent as string,
        status: "completed",
      });

      // Notify sitter about new booking
      const { data: booking } = await supabase
        .from("bookings")
        .select("sitter_id")
        .eq("id", bookingId)
        .single();

      if (booking?.sitter_id) {
        sendPushToUser(booking.sitter_id, {
          title: "Nueva reserva",
          body: "Tienes una nueva solicitud de reserva",
          url: "/es/dashboard",
        }).catch(() => {});
      }

      // Audit log
      await supabase.from("audit_log").insert({
        user_id: session.metadata?.owner_id,
        action: "payment.completed",
        resource_type: "booking",
        resource_id: bookingId,
        details: {
          amount: (session.amount_total ?? 0) / 100,
          stripe_session_id: session.id,
        },
      });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string;

    if (paymentIntentId) {
      await supabase
        .from("payments")
        .update({ status: "refunded" })
        .eq("stripe_payment_intent_id", paymentIntentId);
    }
  }

  return NextResponse.json({ received: true });
}
