"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Sitter = {
  id: string;
  full_name: string;
  hourly_rate: number;
  is_verified: boolean;
  distance_meters: number;
  lat: number;
  lng: number;
};

type Props = {
  sitters: Sitter[];
  center: { lat: number; lng: number } | null;
  onSitterClick?: (id: string) => void;
};

export function SitterMap({ sitters, center, onSitterClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const locale = useLocale();
  const es = locale === "es";

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const mapCenter = center ?? { lat: 40.4168, lng: -3.7038 }; // Default: Madrid
    const map = L.map(mapRef.current).setView(
      [mapCenter.lat, mapCenter.lng],
      sitters.length > 0 ? 12 : 6
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // User location marker
    if (center) {
      const userIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([center.lat, center.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(es ? "Tu ubicación" : "Your location");
    }

    // Sitter markers
    const bounds: L.LatLngExpression[] = center ? [[center.lat, center.lng]] : [];

    sitters.forEach((sitter) => {
      const sitterIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:#16a34a;border:3px solid white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;">${sitter.hourly_rate.toFixed(0)}€</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const verified = sitter.is_verified
        ? `<span style="color:#16a34a;font-size:11px;">✓ ${es ? "Verificado" : "Verified"}</span>`
        : "";

      const distance = Math.round(sitter.distance_meters / 1000);

      const marker = L.marker([sitter.lat, sitter.lng], { icon: sitterIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui;min-width:140px;">
            <strong style="font-size:14px;">${sitter.full_name}</strong><br/>
            <span style="color:#16a34a;font-weight:600;">${sitter.hourly_rate.toFixed(0)}€</span>
            <span style="color:#78716c;font-size:12px;"> / ${es ? "visita" : "visit"}</span><br/>
            <span style="color:#78716c;font-size:12px;">${distance} km</span>
            ${verified ? `<br/>${verified}` : ""}
            <br/><a href="/${locale}/sitter/${sitter.id}" style="color:#16a34a;font-size:12px;font-weight:600;text-decoration:none;">${es ? "Ver perfil →" : "View profile →"}</a>
          </div>`,
          { closeButton: false }
        );

      if (onSitterClick) {
        marker.on("click", () => onSitterClick(sitter.id));
      }

      bounds.push([sitter.lat, sitter.lng]);
    });

    // Fit bounds if we have markers
    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [sitters, center, locale, es, onSitterClick]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-2xl border border-stone-100"
      style={{ minHeight: 400 }}
    />
  );
}
