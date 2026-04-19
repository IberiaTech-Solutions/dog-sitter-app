"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Card, Textarea, Button } from "@/components/ui";
import { toast } from "sonner";

type Props = {
  bookingId: string;
  revieweeId: string;
};

export function ReviewForm({ bookingId, revieweeId }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment: comment.trim() || null,
      language: locale,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    // Check for available discount codes to reward the reviewer
    const { data: discount } = await supabase
      .from("partner_discounts")
      .select("code, partner_name, discount_percent")
      .eq("is_active", true)
      .gte("valid_until", new Date().toISOString())
      .limit(1)
      .single();

    if (discount) {
      toast.success(
        locale === "es" ? "¡Gracias por tu opinión!" : "Thanks for your review!",
        {
          description: locale === "es"
            ? `Usa el código ${discount.code} para ${discount.discount_percent}% de descuento en ${discount.partner_name}`
            : `Use code ${discount.code} for ${discount.discount_percent}% off at ${discount.partner_name}`,
          duration: 10000,
        }
      );
    } else {
      toast.success(locale === "es" ? "¡Opinión enviada!" : "Review submitted!");
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Star rating */}
      <Card>
        <label className="block text-sm font-medium text-ink">
          {locale === "es" ? "Puntuación" : "Rating"}
        </label>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110"
            >
              {star <= rating ? (
                <span className="text-yellow-400">★</span>
              ) : (
                <span className="text-ink-soft">★</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Comment */}
      <Card>
        <Textarea
          label={locale === "es" ? "Comentario (opcional)" : "Comment (optional)"}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder={
            locale === "es"
              ? "Cuéntanos tu experiencia..."
              : "Tell us about your experience..."
          }
        />
      </Card>

      {/* Discount reminder */}
      <div className="rounded-lg bg-brand-soft p-4 text-sm text-brand-ink">
        {locale === "es"
          ? "¡Gracias por dejar una opinión! Recibirás un código de descuento de nuestros partners locales."
          : "Thanks for leaving a review! You'll receive a discount code from our local partners."}
      </div>

      {error && <p className="text-sm text-danger text-center">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full rounded-full"
      >
        {loading
          ? locale === "es"
            ? "Enviando..."
            : "Submitting..."
          : locale === "es"
            ? "Enviar opinión"
            : "Submit review"}
      </Button>
    </form>
  );
}
