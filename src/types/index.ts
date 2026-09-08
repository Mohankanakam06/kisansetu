// Domain & API Contracts per PRD Section 4 & 5

export type CropType =
  | "Tomato"
  | "Onion"
  | "Potato"
  | "Wheat"
  | "Rice"
  | "Soybean"
  | "Chilli"
  | "Cotton";

export type QualityGrade = "A" | "B" | "C";

export type ListingStatus = "active" | "clustered" | "sold";

export type LotStatus = "open" | "ordered" | "delivered";

export type OrderStatus =
  | "placed"
  | "routed"
  | "picked_up"
  | "delivered"
  | "settled";

export type PaymentStatus = "pending" | "partial_paid" | "settled";

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  district?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "farmer" | "buyer";
  language_pref: "hi" | "cg" | "en";
  location?: GeoLocation;
}

export interface Listing {
  id: string;
  farmer_id: string;
  farmer_name?: string;
  crop_type: string;
  quantity_kg: number;
  price_expectation?: number;
  location: GeoLocation;
  status: ListingStatus;
  photo_url?: string;
  created_at: string;
}

export interface LotListingItem {
  listing_id: string;
  farmer_name: string;
  farmer_phone: string;
  quantity_kg: number;
  location: GeoLocation;
  price_per_kg: number;
}

export interface Lot {
  id: string;
  crop_type: string;
  total_quantity_kg: number;
  grade: QualityGrade;
  centroid: GeoLocation;
  status: LotStatus;
  price_per_kg: number;
  listings_count: number;
  listings?: LotListingItem[];
  photo_url?: string;
  defects?: string[];
  created_at: string;
}

export interface QualityGradeResponse {
  grade: QualityGrade;
  defects: string[];
  confidence?: number;
  rubric_notes?: string;
}

export interface Order {
  id: string;
  lot_id: string;
  buyer_id: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  lot?: Lot;
}

export interface RouteStop {
  listing_id: string;
  farmer_name: string;
  farmer_phone?: string;
  quantity_kg: number;
  lat: number;
  lng: number;
  address: string;
  stop_type: "pickup" | "delivery";
  stage_completed: boolean;
}

export interface OptimizeRouteResponse {
  route_geojson: any;
  distance_km: number;
  eta: string;
  duration_minutes: number;
  stops: RouteStop[];
  carbon_saved_kg?: number;
  individual_distance_km?: number;
}

export interface SettlementPayoutResponse {
  payment_status: PaymentStatus;
  amount: number;
  transaction_id: string;
  timestamp: string;
  farmer_payouts?: Array<{
    farmer_id: string;
    farmer_name: string;
    amount: number;
    upi_id?: string;
    status: PaymentStatus;
  }>;
}

// Request Types per PRD Section 5
export interface CreateListingRequest {
  farmer_id?: string;
  crop_type: string;
  quantity_kg: number;
  price_expectation?: number;
  location: GeoLocation;
  farmer_name?: string;
  farmer_phone?: string;
  language?: "hi" | "cg" | "en";
  photo_url?: string;
}

export interface CreateOrderRequest {
  buyer_id: string;
  lot_id: string;
  quantity_kg: number;
}

export interface OptimizeRouteRequest {
  order_id: string;
}

export interface SettlementPayoutRequest {
  order_id: string;
  stage: "pickup" | "delivery";
}

// Razorpay Payment Contracts
export interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface RazorpaySuccessPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessPayload) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

