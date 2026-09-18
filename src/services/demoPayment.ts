import { DemoPaymentRequest, DemoPaymentResponse } from "@/types";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://kisansetu-1-bmg9.onrender.com")
        .replace(/\/+$/, "")
        .replace(/\/api$/, "") + "/api";

export class DemoPaymentService {
  /**
   * High-fidelity isolated simulated payment execution
   * Performs 2.5s network simulation and creates orders/payments record
   */
  static async executeDemoCheckout(payload: DemoPaymentRequest): Promise<DemoPaymentResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/payment/demo-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend demo checkout endpoint unreachable, fallback to client escrow simulator", e);
    }

    // Client-side offline fallback
    const txnId = `TXN_KS_${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
    const orderId = `ORD_${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    // Store in localStorage for cross-dashboard reflection
    try {
      const existingOrders = JSON.parse(localStorage.getItem("kisansetu_demo_orders") || "[]");
      const newOrder = {
        id: orderId,
        crop_type: payload.crop_type,
        quantity_kg: payload.quantity_kg,
        price_per_kg: payload.price_per_kg,
        total_amount: payload.total_amount,
        payment_method: payload.payment_method,
        transaction_id: txnId,
        status: payload.payment_method === "cod" ? "placed" : "paid",
        created_at: new Date().toISOString(),
      };
      existingOrders.unshift(newOrder);
      localStorage.setItem("kisansetu_demo_orders", JSON.stringify(existingOrders));
    } catch {}

    return {
      success: true,
      transaction_id: txnId,
      order_id: orderId,
      amount: payload.total_amount,
      status: payload.payment_method === "cod" ? "placed" : "escrow_locked",
      timestamp: new Date().toISOString(),
      message: "KisanSetu Sandbox: Escrow funds locked in demo vault.",
    };
  }
}
