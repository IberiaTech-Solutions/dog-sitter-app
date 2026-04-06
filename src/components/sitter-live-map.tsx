"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationLog = {
  lat: number;
  lng: number;
  time: string;
};

type Props = {
  locations: LocationLog[];
  sitterName: string;
};

function parsePostGISPoint(location: string): { lat: number; lng: number } | null {
  const match = location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!match) return null;
  return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

export function extractLocations(
  logs: { event_type: string; location?: string | null; created_at: string }[]
): LocationLog[] {
  return logs
    .filter((l) => l.location && (l.event_type === "check_in" || l.event_type === "location_update" || l.event_type === "check_out"))
    .map((l) => {
      const coords = parsePostGISPoint(l.location!);
      if (!coords) return null;
      return { lat: coords.lat, lng: coords.lng, time: l.created_at };
    })
    .filter((l): l is LocationLog => l !== null)
    .reverse(); // chronological order
}

export function SitterLiveMap({ locations, sitterName }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const locale = useLocale();
  const es = locale === "es";

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([43.5322, -5.6611], 14); // Default: Gijón

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      polylineRef.current = null;
    };
  }, []);

  // Update marker and trail when locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || locations.length === 0) return;

    const latLngs: L.LatLngExpression[] = locations.map((l) => [l.lat, l.lng]);
    const latest = locations[locations.length - 1];
    const latestTime = new Date(latest.time).toLocaleTimeString(
      es ? "es-ES" : "en-GB",
      { hour: "2-digit", minute: "2-digit" }
    );

    // Update or create marker
    const sitterIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#16a34a;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(22,163,74,0.5);"></div>`,
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([latest.lat, latest.lng]);
      markerRef.current.setPopupContent(
        `<div style="font-family:system-ui;">
          <strong>${sitterName}</strong><br/>
          <span style="color:#78716c;font-size:12px;">${es ? "Última actualización" : "Last update"}: ${latestTime}</span>
        </div>`
      );
    } else {
      markerRef.current = L.marker([latest.lat, latest.lng], { icon: sitterIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui;">
            <strong>${sitterName}</strong><br/>
            <span style="color:#78716c;font-size:12px;">${es ? "Última actualización" : "Last update"}: ${latestTime}</span>
          </div>`
        );
    }

    // Update or create trail polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
    } else {
      polylineRef.current = L.polyline(latLngs, {
        color: "#16a34a",
        weight: 3,
        opacity: 0.6,
        dashArray: "6 8",
      }).addTo(map);
    }

    // Pan to latest position
    map.panTo([latest.lat, latest.lng]);
  }, [locations, sitterName, es]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full rounded-2xl border border-stone-100"
      style={{ minHeight: 300 }}
    />
  );
}
