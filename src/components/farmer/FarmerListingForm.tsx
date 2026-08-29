"use client";
import React, { useState } from "react";
import { CropType, GeoLocation, CreateListingRequest } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card, Badge } from "@/components/ui";
import {
  MapPin,
  Camera,
  Wheat,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  MicOff,
  ChevronDown,
  Send,
} from "lucide-react";

const CROPS: { value: CropType; label: string; emoji: string; price: number }[] = [
  { value: "Tomato", label: "Tomato (टमाटर)", emoji: "🍅", price: 22 },
  { value: "Onion", label: "Onion (प्याज)", emoji: "🧅", price: 28 },
  { value: "Potato", label: "Potato (आलू)", emoji: "🥔", price: 18 },
  { value: "Wheat", label: "Wheat (गेहूं)", emoji: "🌾", price: 24 },
  { value: "Rice", label: "Rice (चावल)", emoji: "🍚", price: 32 },
  { value: "Soybean", label: "Soybean (सोयाबीन)", emoji: "🫘", price: 42 },
  { value: "Chilli", label: "Chilli (मिर्च)", emoji: "🌶️", price: 65 },
];

export default function FarmerListingForm() {
  const [formStep, setFormStep] = useState(0); // 0: form, 1: processing, 2: result
  const [listing, setListing] = useState({
    cropType: "Tomato" as CropType,
    quantity: 100,
    price: 22,
    name: "Rameshwar Sahu",
    phone: "+91 98765 43210",
    location: "Village Birgaon, Raipur",
  });
  const [result, setResult] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(1);

    const reqData: CreateListingRequest = {
      crop_type: listing.cropType,
      quantity_kg: listing.quantity,
      price_expectation: listing.price,
      farmer_name: listing.name,
      farmer_phone: listing.phone,
      location: { lat: 21.28 + Math.random() * 0.05, lng: 81.65 + Math.random() * 0.05, district: "Raipur", address: listing.location },
      language: "hi",
    };

    const res = await apiService.createFarmerListing(reqData);
    setResult(res);
    setFormStep(2);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (formStep === 2 && result) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-soil-900">Listing Submitted!</h2>
          <p className="text-soil-500">Your produce has been aggregated into a larger lot pool.</p>
        </div>

        <Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl"></div>
          <div className="relative space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Live Lot Aggregation Status</span>
                <p className="text-xl font-bold text-soil-900 mt-1">
                  {result.quantity_kg}kg {result.crop_type} Added
                </p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-emerald-100 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-soil-500">Assigned to Lot</span>
                <span className="font-semibold text-soil-900 font-mono">{result.assigned_lot_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-soil-500">Expected Rate</span>
                <span className="font-bold text-emerald-700">₹{result.price_expectation}/kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-soil-500">Total Value</span>
                <span className="font-bold text-soil-900">₹{(result.price_expectation * result.quantity_kg).toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-emerald-100"></div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-soil-500">Aggregation Status</span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  {result.cluster_status}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200/60 text-sm text-amber-800">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong>Note:</strong> Voice recording integration (Bhashini API) will be added in the full implementation. This prototype uses the web form interface.
            </div>
          </div>
        </div>

        <Button onClick={() => setFormStep(0)} variant="outline" className="w-full">
          Create Another Listing
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-700">
          <MicOff className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Web Listing Prototype</span>
        </div>
        <h2 className="text-2xl font-bold text-soil-900">List Your Produce</h2>
        <p className="text-soil-500">Enter the details manually. Voice integration coming soon.</p>
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white opacity-50 pointer-events-none"></div>
        <div className="relative space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-soil-800">What are you selling?</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wheat className="h-5 w-5 text-soil-400" />
              </div>
              <select
                value={listing.cropType}
                onChange={(e) => {
                  const crop = CROPS.find((c) => c.value === e.target.value);
                  if (crop) setListing({ ...listing, cropType: crop.value, price: crop.price });
                }}
                className="appearance-none w-full bg-white border border-soil-300 rounded-lg pl-10 pr-10 py-2.5 text-soil-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm hover:border-soil-400"
              >
                {CROPS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-soil-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-soil-800">Quantity (kg)</label>
              <input
                type="number"
                value={listing.quantity}
                onChange={(e) => setListing({ ...listing, quantity: Number(e.target.value) })}
                className="w-full bg-white border border-soil-300 rounded-lg px-4 py-2.5 text-soil-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-soil-400 transition-all"
                min={10}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-soil-800">Price (₹/kg)</label>
              <input
                type="number"
                value={listing.price}
                onChange={(e) => setListing({ ...listing, price: Number(e.target.value) })}
                className="w-full bg-white border border-soil-300 rounded-lg px-4 py-2.5 text-soil-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-soil-400 transition-all"
                min={1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-soil-800">Pickup Location</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-soil-400" />
              </div>
              <input
                type="text"
                value={listing.location}
                onChange={(e) => setListing({ ...listing, location: e.target.value })}
                className="w-full bg-white border border-soil-300 rounded-lg pl-10 pr-4 py-2.5 text-soil-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-soil-400 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-soil-800">Farmer Details</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-soil-400" />
                </div>
                <input
                  type="text"
                  value={listing.name}
                  onChange={(e) => setListing({ ...listing, name: e.target.value })}
                  className="w-full bg-white border border-soil-300 rounded-lg pl-9 pr-3 py-2 text-sm text-soil-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                  placeholder="Name"
                  required
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-soil-400" />
                </div>
                <input
                  type="tel"
                  value={listing.phone}
                  onChange={(e) => setListing({ ...listing, phone: e.target.value })}
                  className="w-full bg-white border border-soil-300 rounded-lg pl-9 pr-3 py-2 text-sm text-soil-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                  placeholder="Phone"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Photo Upload Section */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-soil-500" />
            <label className="block text-sm font-semibold text-soil-800">Crop Photo (Optional - AI Grading)</label>
          </div>
          <div className="border-2 border-dashed border-soil-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors relative bg-soil-50/50">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="mx-auto h-32 w-full object-cover rounded-md" />
            ) : (
              <div className="space-y-1">
                <FileText className="mx-auto h-8 w-8 text-soil-400" />
                <p className="text-xs text-soil-500">Tap to upload crop photo for instant grading</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>
      </Card>

      <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-white rounded-full p-1.5 shadow-sm border border-brand-100">
            <span className="text-lg">{CROPS.find(c => c.value === listing.cropType)?.emoji}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-800">Estimated Total Payout</p>
            <p className="text-2xl font-bold text-brand-600 mt-1">
              ₹{(listing.quantity * listing.price).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-brand-600/70 mt-0.5">
              {listing.quantity}kg × ₹{listing.price}/kg
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg shadow-emerald-500/20" isLoading={formStep === 1}>
        <Send className="w-4 h-4" />
        {formStep === 1 ? "Processing with AI Aggregator..." : "Submit Listing to Marketplace"}
      </Button>
    </form>
  );
}
