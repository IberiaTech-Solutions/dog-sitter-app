import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const COMMISSION_RATE = 0.18;
const VALID_SERVICES = ["dog_walking", "pet_sitting", "drop_in", "overnight", "daycare"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { sitter_id, pet_id, service_type, start_date, end_date, owner_notes, locale } = body;

  // Validate inputs
  if (!sitter_id || !pet_id || !service_type || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!VALID_SERVICES.includes(service_type)) {
    return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
  }

  const startDt = new Date(start_date);
  const endDt = new Date(end_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  if (startDt < now) {
    return NextResponse.json({ error: "Start date must be in the future" }, { status: 400 });
  }

  if (endDt <= startDt) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  // Check for overlapping bookings (exclude meet & greets)
  const { data: overlapping } = await supabase
    .from("bookings")
    .select("id")
    .eq("sitter_id", sitter_id)
    .eq("is_meet_greet", false)
    .in("status", ["requested", "confirmed", "in_progress"])
    .lt("start_date", end_date)
    .gt("end_date", start_date);

  if (overlapping && overlapping.length > 0) {
    const msg = locale === "es"
      ? "Este cuidador ya tiene una reserva durante estas fechas"
      : "This sitter already has a booking during these dates";
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  // SERVER-SIDE PRICE CALCULATION
  const { data: sitterProfile, error: sitterError } = await supabase
    .from("sitter_profiles")
    .select("hourly_rate")
    .eq("id", sitter_id)
    .single();

  if (sitterError || !sitterProfile) {
    return NextResponse.json({ error: "Sitter not found" }, { status: 404 });
  }

  // Fetch sitter name for Stripe description
  const { data: sitterInfo } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", sitter_id)
    .single();

  const { data: petInfo } = await supabase
    .from("pets")
    .select("name")
    .eq("id", pet_id)
    .single();

  const days = Math.max(1, Math.ceil((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyRate = Number(sitterProfile.hourly_rate);
  const subtotal = days * dailyRate;
  const commissionAmount = Math.round(subtotal * COMMISSION_RATE * 100) / 100;
  const totalAmount = Math.round((subtotal + commissionAmount) * 100) / 100;

  // Create booking with server-calculated amounts
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      owner_id: user.id,
      sitter_id,
      pet_id,
      service_type,
      start_date,
      end_date,
      daily_rate: dailyRate,
      total_amount: totalAmount,
      commission_amount: commissionAmount,
      commission_rate: COMMISSION_RATE,
      owner_notes: owner_notes ?? null,
      status: "pending_payment",
    })
    .select()
    .single();

  if (bookingError) {
    return NextResponse.json({ error: "Could not create booking" }, { status: 400 });
  }

  // Create Stripe Checkout session — owner pays upfront
  const sitterName = sitterInfo?.full_name ?? "Sitter";
  const petName = petInfo?.name ?? "";
  const es = locale === "es";

  const description = es
    ? `Cuidado de ${petName} por ${sitterName} — ${days} día(s)`
    : `Care for ${petName} by ${sitterName} — ${days} day(s)`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectLocale = locale === "es" ? "es" : "en";

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    locale: es ? "es" : "en",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(totalAmount * 100),
          product_data: {
            name: es ? `Reserva — ${sitterName}` : `Booking — ${sitterName}`,
            description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      booking_id: booking.id,
      owner_id: user.id,
    },
    success_url: `${appUrl}/${redirectLocale}/dashboard?payment=success&booking=${booking.id}`,
    cancel_url: `${appUrl}/${redirectLocale}/dashboard?payment=cancelled&booking=${booking.id}`,
  });

  return NextResponse.json({ url: session.url });
}
