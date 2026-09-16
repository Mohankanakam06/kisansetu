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
  stops?: Array<{ lat: number; lng: number; label?: string; status?: string; kg?: string }>;
  isPicker?: boolean;
  onLocationSelect?: (loc: { lat: number; lng: number }) => void;
  selectedLocation?: GeoLocation | null;
  height?: string;
  routingViewMode?: "ai_clustered" | "traditional";
  showConvergenceLines?: boolean;
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
  routingViewMode = "ai_clustered",
  showConvergenceLines = true,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const convergenceLayerRef = useRef<any>(null);

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

        // CartoDB Voyager High-Res Map Tiles
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
          }
        ).addTo(map);

        convergenceLayerRef.current = L.layerGroup().addTo(map);
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
      if (!map) return;

      // 1. Clear previous dynamic layers
      if (markersLayerRef.current) markersLayerRef.current.clearLayers();
      if (convergenceLayerRef.current) convergenceLayerRef.current.clearLayers();
      if (routeLayerRef.current) routeLayerRef.current.clearLayers();

      // 2. Render Lots & Farm Convergence Pins
      lots.forEach((lot) => {
        const isSelected = selectedLot?.id === lot.id;
        const gradeColor =
          lot.grade === "A" ? "#15803d" : lot.grade === "B" ? "#b45309" : "#475569";
        const emoji = cropEmojis[lot.crop_type] || "🌿";

        // Draw Centroid Lot Gold/Emerald Marker
        const centroidIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              background-color: ${isSelected ? "#1B4965" : gradeColor};
              color: white;
              padding: 5px 10px;
              border-radius: 9999px;
              font-weight: 800;
              font-size: 11px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              border: 2px solid ${isSelected ? "#F4A261" : "#ffffff"};
              transform: scale(${isSelected ? 1.2 : 1});
              transition: transform 0.2s ease;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span>${emoji} ${lot.crop_type}</span>
              <span style="background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 6px;">Gr.${lot.grade}</span>
            </div>
          `,
          iconSize: [110, 32],
          iconAnchor: [55, 16],
        });

        const marker = L.marker([lot.centroid.lat, lot.centroid.lng], {
          icon: centroidIcon,
        });

        if (onSelectLot) {
          marker.on("click", () => onSelectLot(lot));
        }

        marker.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <strong>${emoji} ${lot.crop_type} Aggregated Lot</strong><br/>
            <span>${lot.total_quantity_kg.toLocaleString()} kg • ₹${lot.price_per_kg}/kg</span><br/>
            <span style="color: #15803d; font-weight: 700;">📍 ${lot.listings_count || 3} Clustered Farms</span>
          </div>`,
          { direction: "top", offset: [0, -12] }
        );

        marker.addTo(markersLayerRef.current);

        // Render clustered individual farm pins converging into lot centroid
        if (showConvergenceLines) {
          const farmOffsets = [
            { dLat: 0.015, dLng: 0.018, name: "Sahu Farm" },
            { dLat: -0.018, dLng: 0.012, name: "Patel Farm" },
            { dLat: 0.008, dLng: -0.022, name: "Verma Farm" },
          ];

          farmOffsets.forEach((offset, idx) => {
            const farmLat = lot.centroid.lat + offset.dLat;
            const farmLng = lot.centroid.lng + offset.dLng;

            // Small Green Farm Pin
            const farmIcon = L.divIcon({
              className: "custom-farm-marker",
              html: `
                <div style="
                  background-color: #386641;
                  color: white;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  border: 2px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
                ">
                  🌾
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            const farmMarker = L.marker([farmLat, farmLng], { icon: farmIcon });
            farmMarker.bindTooltip(`<b>${offset.name} (Farm Gate)</b>`, { direction: "top" });
            farmMarker.addTo(convergenceLayerRef.current);

            // Dashed convergence line connecting farm to centroid
            L.polyline(
              [
                [farmLat, farmLng],
                [lot.centroid.lat, lot.centroid.lng],
              ],
              {
                color: "#1B4965",
                weight: 1.5,
                opacity: 0.5,
                dashArray: "4, 4",
              }
            ).addTo(convergenceLayerRef.current);
          });
        }
      });

      // 3. Render Picker Location Marker
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
              📍 Pinned Farm Gate
            </div>
          `,
          iconSize: [140, 34],
          iconAnchor: [70, 17],
        });
        const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
          icon: pickerIcon,
        });
        marker.addTo(markersLayerRef.current);
      }

      // 4. Render Route Stops
      stops.forEach((stop, i) => {
        const isMandi = i === stops.length - 1;
        const stopIcon = L.divIcon({
          className: "custom-stop-marker",
          html: `
            <div style="
              background-color: ${isMandi ? "#1B4965" : stop.status === "completed" ? "#386641" : "#C04A22"};
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 9999px;
              font-weight: 800;
              font-size: 11px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 3px 10px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              ${isMandi ? "🏢" : i + 1}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon });
        if (stop.label) {
          marker.bindTooltip(`<b>${stop.label}</b><br/>${stop.kg || ""}`, { direction: "top" });
        }
        marker.addTo(markersLayerRef.current);
      });

      // 5. Render Polylines according to Routing View Mode
      if (stops.length > 1) {
        const mandi = stops[stops.length - 1];

        if (routingViewMode === "traditional") {
          // Traditional: Red radial trips from each farm independently to Mandi
          for (let i = 0; i < stops.length - 1; i++) {
            const farm = stops[i];
            L.polyline(
              [
                [farm.lat, farm.lng],
                [mandi.lat, mandi.lng],
              ],
              {
                color: "#C04A22",
                weight: 3.5,
                opacity: 0.8,
                dashArray: "6, 6",
              }
            ).addTo(routeLayerRef.current);
          }
        } else {
          // AI Clustered: Emerald Single-Loop connecting all waypoints
          if (routeGeojson) {
            try {
              const gLayer = L.geoJSON(routeGeojson, {
                style: {
                  color: "#386641",
                  weight: 5,
                  opacity: 0.9,
                  lineJoin: "round",
                },
              });
              gLayer.addTo(routeLayerRef.current);
            } catch (err) {
              console.error("Error rendering GeoJSON route", err);
            }
          } else {
            // Fallback polyline connecting sequentially
            const latLngs = stops.map((s) => [s.lat, s.lng]);
            L.polyline(latLngs, {
              color: "#386641",
              weight: 5,
              opacity: 0.9,
              lineJoin: "round",
            }).addTo(routeLayerRef.current);
          }
        }
      }
    };

    initMap();
  }, [lots, selectedLot, routeGeojson, stops, selectedLocation, routingViewMode, showConvergenceLines]);

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
    <div className={`relative w-full ${height} rounded-sm overflow-hidden border-2 border-[#1E1F1C] shadow-[3px_3px_0_0_#1E1F1C] bg-[#EBECE8]`}>
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-sm border-2 border-[#1E1F1C] text-[10px] font-black uppercase text-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#386641] animate-ping" />
        <span>
          {isPicker
            ? "Click map to pin farm location"
            : routingViewMode === "traditional"
            ? "⚠️ 4 Separate Farmer Trips (Congestion)"
            : "⚡ AI Single-Truck Clustered Loop"}
        </span>
      </div>
    </div>
  );
}
