import {
  Lot,
  Listing,
  CreateListingRequest,
  CreateOrderRequest,
  Order,
  OptimizeRouteResponse,
  SettlementPayoutResponse,
  QualityGradeResponse,
  RouteStop,
  RazorpayOrderResponse,
} from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://kisansetu-1-bmg9.onrender.com")
        .replace(/\/+$/, "")
        .replace(/\/api$/, "") + "/api";

// Initial mock data: Raipur, Chhattisgarh agricultural belt & Nashik onion belt
export const initialLots: Lot[] = [
  {
    id: "lot-101",
    crop_type: "Tomato",
    total_quantity_kg: 2400,
    grade: "A",
    centroid: { lat: 21.2514, lng: 81.6296, district: "Raipur", address: "Dharsiwa Aggregation Point, Raipur" },
    status: "open",
    price_per_kg: 22,
    listings_count: 4,
    photo_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    defects: ["None", "Uniform Red Color", "Optimal Firmness"],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    listings: [
      {
        listing_id: "list-1",
        farmer_name: "Rameshwar Sahu",
        farmer_phone: "+91 98765 43210",
        quantity_kg: 600,
        location: { lat: 21.28, lng: 81.65, address: "Village Birgaon" },
        price_per_kg: 22,
      },
      {
        listing_id: "list-2",
        farmer_name: "Dhananjay Verma",
        farmer_phone: "+91 98765 43211",
        quantity_kg: 800,
        location: { lat: 21.23, lng: 81.61, address: "Village Urla" },
        price_per_kg: 22,
      },
      {
        listing_id: "list-3",
        farmer_name: "Lakhan Patel",
        farmer_phone: "+91 98765 43212",
        quantity_kg: 500,
        location: { lat: 21.26, lng: 81.67, address: "Village Boriyakhurd" },
        price_per_kg: 21.5,
      },
      {
        listing_id: "list-4",
        farmer_name: "Komal Sahu",
        farmer_phone: "+91 98765 43213",
        quantity_kg: 500,
        location: { lat: 21.22, lng: 81.64, address: "Village Mandir Hasaud" },
        price_per_kg: 22.5,
      },
    ],
  },
  {
    id: "lot-102",
    crop_type: "Onion",
    total_quantity_kg: 4500,
    grade: "A",
    centroid: { lat: 20.0059, lng: 73.7898, district: "Nashik", address: "Lasalgaon APMC Cluster, Nashik" },
    status: "open",
    price_per_kg: 28,
    listings_count: 5,
    photo_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    defects: ["Single centered", "Dry outer skin", "Cured"],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    listings: [
      {
        listing_id: "list-5",
        farmer_name: "Balasaheb Shinde",
        farmer_phone: "+91 98220 11223",
        quantity_kg: 1200,
        location: { lat: 20.14, lng: 74.22, address: "Lasalgaon North" },
        price_per_kg: 28,
      },
      {
        listing_id: "list-6",
        farmer_name: "Vikas Pawar",
        farmer_phone: "+91 98220 33445",
        quantity_kg: 1500,
        location: { lat: 20.08, lng: 74.15, address: "Pimpalgaon Baswant" },
        price_per_kg: 27.5,
      },
      {
        listing_id: "list-7",
        farmer_name: "Sunil Jadhav",
        farmer_phone: "+91 98220 55667",
        quantity_kg: 1800,
        location: { lat: 20.02, lng: 73.95, address: "Ozar Township" },
        price_per_kg: 28.5,
      },
    ],
  },
  {
    id: "lot-103",
    crop_type: "Potato",
    total_quantity_kg: 3200,
    grade: "B",
    centroid: { lat: 21.1904, lng: 81.2849, district: "Durg", address: "Bhilai-Durg Rural Hub, CG" },
    status: "open",
    price_per_kg: 18,
    listings_count: 3,
    photo_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
    defects: ["Minor skin scuffing", "Mixed size 45-65mm"],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    listings: [
      {
        listing_id: "list-8",
        farmer_name: "Ghanshyam Yadav",
        farmer_phone: "+91 94252 09876",
        quantity_kg: 1200,
        location: { lat: 21.21, lng: 81.3, address: "Village Kumhari" },
        price_per_kg: 18,
      },
      {
        listing_id: "list-9",
        farmer_name: "Santosh Deshmukh",
        farmer_phone: "+91 94252 11223",
        quantity_kg: 2000,
        location: { lat: 21.17, lng: 81.25, address: "Village Anda" },
        price_per_kg: 18,
      },
    ],
  },
  {
    id: "lot-104",
    crop_type: "Chilli",
    total_quantity_kg: 1100,
    grade: "A",
    centroid: { lat: 21.4975, lng: 81.6872, district: "Tilda", address: "Tilda Neora Agri Yard" },
    status: "open",
    price_per_kg: 65,
    listings_count: 2,
    photo_url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80",
    defects: ["High pungency SHU", "Deep green luster"],
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    listings: [
      {
        listing_id: "list-10",
        farmer_name: "Devendra Sahu",
        farmer_phone: "+91 91111 22233",
        quantity_kg: 600,
        location: { lat: 21.51, lng: 81.69, address: "Tilda Rural Sector 2" },
        price_per_kg: 65,
      },
      {
        listing_id: "list-11",
        farmer_name: "Hemlal Kurre",
        farmer_phone: "+91 91111 44455",
        quantity_kg: 500,
        location: { lat: 21.48, lng: 81.67, address: "Bhatapara Border" },
        price_per_kg: 65,
      },
    ],
  },
];

export const initialOrders: Order[] = [
  {
    id: "ord-901",
    lot_id: "lot-101",
    buyer_id: "buyer-001",
    crop_type: "Tomato",
    quantity_kg: 2400,
    price_per_kg: 22,
    total_amount: 52800,
    status: "placed",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    lot: initialLots[0],
  },
];

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiService {
  private lots: Lot[] = [...initialLots];
  private orders: Order[] = [...initialOrders];
  private listings: Listing[] = [];

  // 1. Fetch Lots
  async getLots(params?: {
    crop?: string;
    grade?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ lots: Lot[] }> {
    if (!USE_MOCK) {
      try {
        const query = new URLSearchParams();
        if (params?.crop) query.append("crop", params.crop);
        if (params?.grade) query.append("grade", params.grade);
        if (params?.minPrice != null) query.append("minPrice", String(params.minPrice));
        if (params?.maxPrice != null) query.append("maxPrice", String(params.maxPrice));
        const res = await fetch(`${API_BASE_URL}/lots?${query.toString()}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("API /lots unavailable, falling back to mock dataset", e);
      }
    }

    await delay(300);
    let filtered = [...this.lots];
    if (params?.crop && params.crop !== "All") {
      filtered = filtered.filter((l) => l.crop_type.toLowerCase() === params.crop!.toLowerCase());
    }
    if (params?.grade && params.grade !== "All") {
      filtered = filtered.filter((l) => l.grade === params.grade);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.crop_type.toLowerCase().includes(q) ||
          l.centroid.district?.toLowerCase().includes(q) ||
          l.centroid.address?.toLowerCase().includes(q)
      );
    }
    if (params?.minPrice != null) {
      filtered = filtered.filter((l) => l.price_per_kg >= params!.minPrice!);
    }
    if (params?.maxPrice != null) {
      filtered = filtered.filter((l) => l.price_per_kg <= params!.maxPrice!);
    }
    return { lots: filtered };
  }

  // 2. Fetch Single Lot
  async getLotById(id: string): Promise<Lot | null> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/lots/${id}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn(`API /lots/${id} unavailable, falling back to mock`, e);
      }
    }
    await delay(200);
    return this.lots.find((l) => l.id === id) || null;
  }

  // 3. Create Farmer Listing (Prototype Form -> Aggregation simulation)
  async createFarmerListing(data: CreateListingRequest): Promise<{
    listing_id: string;
    crop_type: string;
    quantity_kg: number;
    price_expectation: number;
    location: { lat: number; lng: number };
    cluster_status?: string;
    assigned_lot_id?: string;
  }> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/farmer/listing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("API /farmer/listing failed, using fallback", e);
      }
    }

    await delay(600);
    const newListingId = `list-${Date.now().toString().slice(-4)}`;
    const newListing: Listing = {
      id: newListingId,
      farmer_id: data.farmer_id || `farmer-${Date.now().toString().slice(-3)}`,
      farmer_name: data.farmer_name || "Self Farmer",
      crop_type: data.crop_type,
      quantity_kg: data.quantity_kg,
      price_expectation: data.price_expectation || 25,
      location: data.location,
      status: "clustered",
      photo_url: data.photo_url,
      created_at: new Date().toISOString(),
    };
    this.listings.push(newListing);

    // Simulate real-time aggregation with existing matching lot or create new lot
    const matchingLotIndex = this.lots.findIndex(
      (l) => l.crop_type.toLowerCase() === data.crop_type.toLowerCase() && l.status === "open"
    );

    let assignedLotId = "";
    if (matchingLotIndex >= 0) {
      const lot = this.lots[matchingLotIndex];
      lot.total_quantity_kg += data.quantity_kg;
      lot.listings_count += 1;
      lot.listings = lot.listings || [];
      lot.listings.push({
        listing_id: newListingId,
        farmer_name: data.farmer_name || "Farmer",
        farmer_phone: data.farmer_phone || "+91 99999 00000",
        quantity_kg: data.quantity_kg,
        location: data.location,
        price_per_kg: data.price_expectation || lot.price_per_kg,
      });
      assignedLotId = lot.id;
    } else {
      const newLotId = `lot-${Date.now().toString().slice(-3)}`;
      const createdLot: Lot = {
        id: newLotId,
        crop_type: data.crop_type,
        total_quantity_kg: data.quantity_kg,
        grade: "A",
        centroid: data.location,
        status: "open",
        price_per_kg: data.price_expectation || 24,
        listings_count: 1,
        photo_url: data.photo_url || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
        defects: ["Fresh produce", "High moisture"],
        created_at: new Date().toISOString(),
        listings: [
          {
            listing_id: newListingId,
            farmer_name: data.farmer_name || "Farmer",
            farmer_phone: data.farmer_phone || "+91 99999 00000",
            quantity_kg: data.quantity_kg,
            location: data.location,
            price_per_kg: data.price_expectation || 24,
          },
        ],
      };
      this.lots.unshift(createdLot);
      assignedLotId = newLotId;
    }

    return {
      listing_id: newListingId,
      crop_type: data.crop_type,
      quantity_kg: data.quantity_kg,
      price_expectation: data.price_expectation || 25,
      location: { lat: data.location.lat, lng: data.location.lng },
      cluster_status: "Successfully aggregated into nearby lot pool",
      assigned_lot_id: assignedLotId,
    };
  }

  // 4. Quality Photo Grading (AI Vision Simulation)
  async gradeProducePhoto(lotId: string, photoUrl: string): Promise<QualityGradeResponse> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/quality/grade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lot_id: lotId, photo_url: photoUrl }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("API /quality/grade failed, using fallback", e);
      }
    }

    await delay(1000);
    // Simulating intelligent vision analysis
    return {
      grade: "A",
      defects: ["Zero fungal presence", "Firmness index: 94%", "Uniform 55-65mm diameter", "Export grade surface"],
      confidence: 0.96,
      rubric_notes: "Visual inspection confirms Grade A premium quality with under 2% skin blemish.",
    };
  }

  // 5. Place Buyer Order
  async createOrder(data: CreateOrderRequest): Promise<{ order_id: string; status: string; order: Order }> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("API /orders failed, using fallback", e);
      }
    }

    await delay(500);
    const targetLot = this.lots.find((l) => l.id === data.lot_id);
    const orderId = `ord-${Date.now().toString().slice(-4)}`;

    const newOrder: Order = {
      id: orderId,
      lot_id: data.lot_id,
      buyer_id: data.buyer_id,
      crop_type: targetLot ? targetLot.crop_type : "Produce",
      quantity_kg: data.quantity_kg,
      price_per_kg: targetLot ? targetLot.price_per_kg : 25,
      total_amount: data.quantity_kg * (targetLot ? targetLot.price_per_kg : 25),
      status: "placed",
      created_at: new Date().toISOString(),
      lot: targetLot,
    };

    if (targetLot) {
      targetLot.status = "ordered";
    }

    this.orders.unshift(newOrder);
    return {
      order_id: orderId,
      status: "placed",
      order: newOrder,
    };
  }

  // 6. Get Orders
  async getOrders(): Promise<{ orders: Order[] }> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("API /orders failed, using fallback", e);
      }
    }
    await delay(200);
    return { orders: this.orders };
  }

  // 7. Route Optimization Simulation
  async optimizeRoute(orderId: string): Promise<OptimizeRouteResponse> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/routing/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("API /routing/optimize failed, using fallback", e);
      }
    }

    await delay(900);
    const order = this.orders.find((o) => o.id === orderId) || this.orders[0];
    const lot = order?.lot || this.lots[0];

    const stops: RouteStop[] = (lot.listings || []).map((listing, idx) => ({
      listing_id: listing.listing_id,
      farmer_name: listing.farmer_name,
      farmer_phone: listing.farmer_phone,
      quantity_kg: listing.quantity_kg,
      lat: listing.location.lat,
      lng: listing.location.lng,
      address: listing.location.address || `Farm Gate Stop #${idx + 1}`,
      stop_type: "pickup",
      stage_completed: false,
    }));

    // Add destination stop
    stops.push({
      listing_id: "dest-buyer",
      farmer_name: "Buyer Distribution Hub",
      farmer_phone: "+91 80000 11111",
      quantity_kg: order.quantity_kg,
      lat: 21.24,
      lng: 81.63,
      address: "Mowa Mandi Cold Hub, Raipur",
      stop_type: "delivery",
      stage_completed: false,
    });

    // Generate GeoJSON line coordinate array
    const coordinates = stops.map((s) => [s.lng, s.lat]);

    // Update order status to 'routed'
    if (order) order.status = "routed";

    return {
      route_geojson: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {
              color: "#16a34a",
              weight: 5,
            },
          },
        ],
      },
      distance_km: 26.4,
      duration_minutes: 52,
      eta: new Date(Date.now() + 52 * 60000).toISOString(),
      stops: stops,
      carbon_saved_kg: 18.2,
      individual_distance_km: 84.0, // 4 individual trips vs 1 consolidated
    };
  }

  // 8. Settlement Payout (Simulate Instant Payment)
  async triggerSettlement(orderId: string, stage: "pickup" | "delivery"): Promise<SettlementPayoutResponse> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE_URL}/settlement/payout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId, stage }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("API /settlement/payout failed, using fallback", e);
      }
    }

    await delay(800);
    const order = this.orders.find((o) => o.id === orderId) || this.orders[0];
    const lot = order?.lot || this.lots[0];

    const amount = stage === "pickup" ? order.total_amount * 0.4 : order.total_amount * 0.6;
    const status = stage === "pickup" ? "partial_paid" : "settled";

    if (order) {
      order.status = stage === "pickup" ? "picked_up" : "settled";
    }

    const farmerPayouts = (lot.listings || []).map((l, i) => ({
      farmer_id: `f-${i + 1}`,
      farmer_name: l.farmer_name,
      amount: Math.round(l.quantity_kg * l.price_per_kg * (stage === "pickup" ? 0.4 : 0.6)),
      upi_id: `${l.farmer_name.toLowerCase().replace(/\s+/g, "")}@okaxis`,
      status: status as any,
    }));

    return {
      payment_status: status as any,
      amount: amount,
      transaction_id: `TXN-SIH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      farmer_payouts: farmerPayouts,
    };
  }

  // 9. Razorpay Payment Methods
  async createRazorpayOrder(amount: number, userId: string): Promise<RazorpayOrderResponse> {
    const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, user_id: userId }),
    });
    if (!res.ok) throw new Error("Failed to create payment order");
    return await res.json();
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string, listingId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, payment_id: paymentId, signature, listing_id: listingId }),
    });
    if (!res.ok) throw new Error("Payment verification failed");
    return await res.json();
  }
}

export const apiService = new ApiService();
