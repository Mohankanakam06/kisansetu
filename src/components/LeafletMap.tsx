"use client";
import React, { useEffect, useRef } from "react";
import { Lot, GeoLocation } from "@/types";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  lots?: Lot[];
  selectedLot?: Lot | null;
  onSelectLot?: (lot: Lot) => void;
  center?: GeoLocation;
  zoom?: number;
  routeGeojson?: any;
  stops?: Array<{ lat: number; lng: number; label?: string }>;
  isPicker?: boolean;
  onLocationSelect?: (loc: { lat: number; lng: number }) => void;
  selectedLocation?: GeoLocation | null;
  height?: string;
}

const cropEmojis: Record<string, string> = {
  Tomato: "🍅",
  Onion: "🧅",
  Potato: "🥔",
  Wheat: "🌾",
  Rice: "🍚",
  Soybean: "🫘",
  Chilli: "🌶️",
  Ginger: "🫞",
  Garlic: "🧄",
};

export default function LeafletMap({
  lots = [],
  selectedLot = null,
  onSelectLot,
  center = { lat: 21.2514, lng: 81.6296 },
  zoom = 6,
  routeGeojson = null,
  stops = [],
  isPicker = false,
  onLocationSelect,
  selectedLocation = null,
  height = "h-[450px]",
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L: any;
    const initMap = async () => {
      L = (await import("leaflet")).default;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: zoom,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        routeLayerRef.current = L.layerGroup().addTo(map);

        if (isPicker && onLocationSelect) {
          map.on("click", (e: any) => {
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Render markers layer
      if (markersLayerRef.current && map) {
        markersLayerRef.current.clearLayers();

        // 1. Render Lots markers
        lots.forEach((lot) => {
          const isSelected = selectedLot?.id === lot.id;
          const gradeColor =
            lot.grade === "A" ? "#15803d" : lot.grade === "B" ? "#b45309" : "#475569";
          const emoji = cropEmojis[lot.crop_type] || "🌿";

          const customIcon = L.divIcon({
            className: "custom-leaflet-marker",
            html: `
              <div style="
                background-color: ${isSelected ? "#005f39" : gradeColor};
                color: white;
                padding: 5px 10px;
                border-radius: 9999px;
                font-weight: 700;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border: 2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.9)"};
                transform: scale(${isSelected ? 1.25 : 1});
                transition: transform 0.2s ease;
                white-space: nowrap;
                cursor: pointer;
              ">
                <span>${emoji} ${lot.crop_type}</span>
                <span style="background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 6px;">Gr.${lot.grade}</span>
              </div>
            `,
            iconSize: [100, 32],
            iconAnchor: [50, 16],
          });

          const marker = L.marker([lot.centroid.lat, lot.centroid.lng], {
            icon: customIcon,
          });

          if (onSelectLot) {
            marker.on("click", () => onSelectLot(lot));
          }

          marker.bindTooltip(
            `<div style="font-family: sans-serif; font-size: 12px;">
              <strong>${emoji} ${lot.crop_type} Aggregated Lot</strong><br/>
              <span>${lot.total_quantity_kg.toLocaleString()} kg • ₹${lot.price_per_kg}/kg</span><br/>
              <span style="color: #15803d; font-weight: 600;">${lot.listings_count} Farmer Listings</span>
            </div>`,
            { direction: "top", offset: [0, -12] }
          );

          marker.addTo(markersLayerRef.current);
        });

        // 2. Render Picker Location Marker
        if (selectedLocation) {
          const pickerIcon = L.divIcon({
            className: "custom-picker-marker",
            html: `
              <div style="
                background-color: #dc2626;
                color: white;
                padding: 6px 12px;
                border-radius: 9999px;
                font-weight: 800;
                font-size: 12px;
                box-shadow: 0 4px 14px rgba(220,38,38,0.5);
                border: 2px solid white;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                📍 Pinned Location
              </div>
            `,
            iconSize: [120, 34],
            iconAnchor: [60, 17],
          });
          const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
            icon: pickerIcon,
          });
          marker.addTo(markersLayerRef.current);
        }

        // 3. Render Route Stops
        stops.forEach((stop, i) => {
          const stopIcon = L.divIcon({
            className: "custom-stop-marker",
            html: `
              <div style="
                background-color: ${i === stops.length - 1 ? "#005f39" : "#2563eb"};
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 9999px;
                font-weight: 800;
                font-size: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">
                ${i === stops.length - 1 ? "🏢" : i + 1}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon });
          if (stop.label) {
            marker.bindTooltip(`<b>${stop.label}</b>`, { direction: "top" });
          }
          marker.addTo(markersLayerRef.current);
        });
      }

      // Render Route GeoJSON / Polyline
      if (routeLayerRef.current && map) {
        routeLayerRef.current.clearLayers();
        if (routeGeojson) {
          try {
            const gLayer = L.geoJSON(routeGeojson, {
              style: {
                color: "#005f39",
                weight: 5,
                opacity: 0.85,
                lineJoin: "round",
              },
            });
            gLayer.addTo(routeLayerRef.current);
            map.fitBounds(gLayer.getBounds(), { padding: [40, 40] });
          } catch (err) {
            console.error("Error rendering GeoJSON route", err);
          }
        }
      }
    };

    initMap();
  }, [lots, selectedLot, routeGeojson, stops, selectedLocation]);

  // Pan to selected lot
  useEffect(() => {
    if (mapInstanceRef.current && selectedLot) {
      mapInstanceRef.current.setView(
        [selectedLot.centroid.lat, selectedLot.centroid.lng],
        9,
        { animate: true }
      );
    }
  }, [selectedLot]);

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100`}>
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
        <span>{isPicker ? "Click map to pin farm location" : routeGeojson ? "Live Pickup Route Tracked" : "Interactive Aggregation Map"}</span>
      </div>
    </div>
  );
}
