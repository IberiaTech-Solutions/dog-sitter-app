import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COMMISSION_RATE = 0.18;
const VALID_SERVICES = ["dog_walking", "pet_sitting", "drop_in", "overnight"];

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

  // SERVER-SIDE PRICE CALCULATION
  const { data: sitterProfile, error: sitterError } = await supabase
    .from("sitter_profiles")
    .select("hourly_rate")
    .eq("id", sitter_id)
    .single();

  if (sitterError || !sitterProfile) {
    return NextResponse.json({ error: "Sitter not found" }, { status: 404 });
  }

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
      status: "requested",
    })
    .select()
    .single();

  if (bookingError) {
    return NextResponse.json({ error: "Could not create booking" }, { status: 400 });
  }

  // TODO: Stripe payment integration
  // When Stripe is configured, uncomment the checkout session creation below
  // and change the response to return { url: session.url }
  //
  // For now, bookings are created as "requested" and the sitter
  // accepts/declines from their dashboard. Payment will be collected
  // when Stripe keys are added.

  const redirectLocale = locale === "es" ? "es" : "en";
  return NextResponse.json({
    success: true,
    booking_id: booking.id,
    redirect: `/${redirectLocale}/dashboard?booking=success`,
  });
}
