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

export type QualityGrade = "A" | "B" | "C" | "D" | "REJECTED";

export type ListingStatus = "active" | "clustered" | "sold";

export type LotStatus = "open" | "ordered" | "delivered";

export type OrderStatus =
  | "placed"
  | "paid"
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
  // Trading window timestamps (ISO 8601). Optional; if present, UI shows countdown to start/end.
  trade_start?: string;
  trade_end?: string;
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

export interface QualityMetrics {
  estimated_size_cm?: number;
  blemish_pct?: number;
  rot_pct?: number;
  color_uniformity_pct?: number;
  calibrated?: boolean;
  laplacian_variance?: number;
  std_dev?: number;
  screen_recapture_score?: number;
  subpixel_grid_density?: number;
  moire_pattern_detected?: boolean;
}

export interface QualityGradeResponse {
  grade: QualityGrade;
  is_produce?: boolean;
  confidence?: number;
  crop_detected?: string;
  defects: string[];
  passed_items?: string[];
  rubric_notes?: string;
  metrics?: QualityMetrics;
  photo_url?: string;
  lot_id?: string;
  demo_mode?: boolean;
}

export interface TickerItem {
  crop_type: string;
  mandi_name?: string;
  mandi?: string;
  state: string;
  variety: string;
  price_per_kg: number;
  min_price_kg: number;
  max_price_kg: number;
  price_change_pct?: number;
  change_24h_pct?: number;
  predicted_price_7d: number;
  predicted_trend_7d: "up" | "down" | "stable";
  confidence: number;
  timestamp?: string | number;
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
  capture_token?: string;
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

export interface FarmerListing {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  fpo_name?: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  location?: {
    lat: number;
    lng: number;
    district?: string;
    address?: string;
  };
  district?: string;
  address?: string;
  grade: "A" | "B" | "C" | "D";
  harvest_date: string;
  photo_url?: string;
  defects?: string[];
  status: "active" | "clustered" | "sold" | "ordered";
  created_at: string;
}

export interface DemoPaymentRequest {
  listing_id?: string;
  lot_id?: string;
  buyer_id: string;
  farmer_id?: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  payment_method: "upi" | "card" | "cod";
  upi_id?: string;
  card_last4?: string;
}

export interface DemoPaymentResponse {
  success: boolean;
  transaction_id: string;
  order_id: string;
  amount: number;
  status: "paid" | "escrow_locked" | "placed";
  timestamp: string;
  message: string;
}
