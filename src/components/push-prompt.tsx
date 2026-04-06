"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui";

export function PushPrompt() {
  const locale = useLocale();
  const es = locale === "es";
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return;

    // Only show after user has been on the dashboard (not on first visit)
    const visits = parseInt(localStorage.getItem("dashboard-visits") ?? "0", 10) + 1;
    localStorage.setItem("dashboard-visits", String(visits));

    const dismissed = localStorage.getItem("push-dismissed");
    if (!dismissed && visits >= 2) setShow(true);
  }, []);

  async function handleEnable() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShow(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setShow(false);
    } catch {
      setShow(false);
    }
    setLoading(false);
  }

  function handleDismiss() {
    localStorage.setItem("push-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 animate-in slide-in-from-bottom-4">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-lg shadow-stone-200/50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900">
              {es ? "Activa las notificaciones" : "Enable notifications"}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {es
                ? "Recibe avisos de reservas, mensajes y actualizaciones."
                : "Get alerts for bookings, messages, and updates."}
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="primary" disabled={loading} onClick={handleEnable}>
                {loading ? "..." : es ? "Activar" : "Enable"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                {es ? "Ahora no" : "Not now"}
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-stone-300 hover:text-stone-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
