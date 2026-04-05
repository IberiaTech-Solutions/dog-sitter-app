import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const {
    sitter_id,
    pet_id,
    service_type,
    start_date,
    end_date,
    daily_rate,
    total_amount,
    commission_amount,
    owner_notes,
    locale,
  } = body;

  // Create booking in database
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      owner_id: user.id,
      sitter_id,
      pet_id,
      service_type,
      start_date,
      end_date,
      daily_rate,
      total_amount,
      commission_amount,
      commission_rate: 0.18,
      owner_notes,
      status: "requested",
    })
    .select()
    .single();

  if (bookingError) {
    return NextResponse.json(
      { error: bookingError.message },
      { status: 400 }
    );
  }

  // Get sitter name for checkout description
  const { data: sitter } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", sitter_id)
    .single();

  // Create Stripe Checkout session
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    locale: locale === "es" ? "es" : "en",
    currency: "eur",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(total_amount * 100), // Stripe uses cents
          product_data: {
            name:
              locale === "es"
                ? `Reserva con ${sitter?.full_name ?? "cuidador"}`
                : `Booking with ${sitter?.full_name ?? "sitter"}`,
            description:
              locale === "es"
                ? `${service_type} — ${start_date} a ${end_date}`
                : `${service_type} — ${start_date} to ${end_date}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      booking_id: booking.id,
      owner_id: user.id,
      sitter_id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard?booking=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/booking/${sitter_id}?cancelled=true`,
  });

  return NextResponse.json({ url: session.url });
}
