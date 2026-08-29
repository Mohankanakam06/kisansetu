"use client";
import React, { useEffect, useRef } from "react";
import { Lot, GeoLocation } from "@/types";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  lots: Lot[];
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
  center?: GeoLocation;
  zoom?: number;
}

export default function LeafletMap({
  lots,
  selectedLot,
  onSelectLot,
  center = { lat: 21.2514, lng: 81.6296 },
  zoom = 10,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

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
        mapInstanceRef.current = map;
      }

      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        lots.forEach((lot) => {
          const isSelected = selectedLot?.id === lot.id;
          const gradeColor =
            lot.grade === "A" ? "#16a34a" : lot.grade === "B" ? "#d97706" : "#6b7280";

          // Custom SVG Marker Icon
          const customIcon = L.divIcon({
            className: "custom-leaflet-marker",
            html: `
              <div style="
                background-color: ${gradeColor};
                color: white;
                padding: 4px 8px;
                border-radius: 9999px;
                font-weight: 700;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                border: 2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.8)"};
                transform: scale(${isSelected ? 1.2 : 1});
                transition: transform 0.2s ease;
                white-space: nowrap;
              ">
                <span>${lot.crop_type}</span>
                <span style="background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 4px;">Gr.${lot.grade}</span>
              </div>
            `,
            iconSize: [80, 30],
            iconAnchor: [40, 15],
          });

          const marker = L.marker([lot.centroid.lat, lot.centroid.lng], {
            icon: customIcon,
          });

          marker.on("click", () => {
            onSelectLot(lot);
          });

          marker.bindTooltip(
            `<b>${lot.crop_type} Aggregated Lot</b><br/>${lot.total_quantity_kg}kg • ₹${lot.price_per_kg}/kg<br/>${lot.listings_count} Farmer Listings`,
            { direction: "top", offset: [0, -10] }
          );

          marker.addTo(markersLayerRef.current);
        });
      }
    };

    initMap();

    return () => {
      // Map cleanup if container removed
    };
  }, [lots, selectedLot]);

  // Pan to selected lot if changed
  useEffect(() => {
    if (mapInstanceRef.current && selectedLot) {
      mapInstanceRef.current.setView(
        [selectedLot.centroid.lat, selectedLot.centroid.lng],
        11,
        { animate: true }
      );
    }
  }, [selectedLot]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-soil-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-soil-200 text-[11px] font-semibold text-soil-700 shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Live Aggregation Centroids</span>
      </div>
    </div>
  );
}
