import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const REFERRAL_BONUS = 5.0; // €5 credit for both

// POST — apply referral code after signup
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { referralCode } = await req.json();
  if (!referralCode) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if user already used a referral
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("referred_by")
    .eq("id", user.id)
    .single();

  if (profile?.referred_by) {
    return NextResponse.json({ error: "Already used a referral" }, { status: 400 });
  }

  // Find referrer by code
  const { data: referrer } = await serviceClient
    .from("profiles")
    .select("id, referral_code")
    .eq("referral_code", referralCode.toUpperCase())
    .single();

  if (!referrer) return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  if (referrer.id === user.id) return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });

  // Mark referred_by
  await serviceClient
    .from("profiles")
    .update({ referred_by: referrer.id })
    .eq("id", user.id);

  // Give credit to both
  await serviceClient.from("referral_credits").insert([
    {
      user_id: referrer.id,
      amount: REFERRAL_BONUS,
      reason: "referrer_bonus",
      related_user_id: user.id,
    },
    {
      user_id: user.id,
      amount: REFERRAL_BONUS,
      reason: "referred_bonus",
      related_user_id: referrer.id,
    },
  ]);

  return NextResponse.json({ ok: true, bonus: REFERRAL_BONUS });
}
