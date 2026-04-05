"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Star rating */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
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
                <span className="text-zinc-300">★</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          {locale === "es" ? "Comentario (opcional)" : "Comment (optional)"}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder={
            locale === "es"
              ? "Cuéntanos tu experiencia..."
              : "Tell us about your experience..."
          }
        />
      </div>

      {/* Discount reminder */}
      <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        {locale === "es"
          ? "¡Gracias por dejar una opinión! Recibirás un código de descuento de nuestros partners locales."
          : "Thanks for leaving a review! You'll receive a discount code from our local partners."}
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading
          ? locale === "es"
            ? "Enviando..."
            : "Submitting..."
          : locale === "es"
            ? "Enviar opinión"
            : "Submit review"}
      </button>
    </form>
  );
}
