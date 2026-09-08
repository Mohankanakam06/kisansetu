"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, IndianRupee, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { apiService } from "@/services/api";

// Ensure Razorpay key environment variable is available.
// In your .env.local file, add: NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourTestKey
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    // Dynamically load the Razorpay checkout script if not available
    if (typeof window !== "undefined" && !window.Razorpay) {
      if (!isScriptLoaded.current) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        isScriptLoaded.current = true;
      }
    }
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create order on the backend
      const amount = 50000; // Mock amount: ₹50,000 for the lot order
      const orderRes = await apiService.createRazorpayOrder(amount, "buyer_123");

      // Safety check: is Razorpay loaded?
      if (!window.Razorpay) {
        setError("Payment gateway is currently unavailable. Please try again later.");
        setLoading(false);
        return;
      }

      // 2. Initialize Razorpay options
      const options = {
        key: RAZORPAY_KEY, // The placeholder or real key (needs to match the backend)
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Kisan Setu",
        description: "Payment for order lot",
        image: "/favicon.ico",
        order_id: orderRes.order_id,
        handler: async (response: any) => {
          try {
            // 3. Verify the payment on the backend after successful capture
            const verifyRes = await apiService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              "lot-101" // dummy listing ID for demo
            );

            if (verifyRes.status === "success") {
              router.push("/payment/success");
            } else {
              router.push("/payment/failed");
            }
          } catch (err) {
            console.error(err);
            router.push("/payment/failed");
          }
        },
        prefill: {
          name: "Mohan",
          email: "mohan@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Kisan Setu Headquarters",
        },
        theme: {
          color: "#10b981", // matches emerald primary
        },
        modal: {
          ondismiss: () => {
             setLoading(false);
             console.log("Payment popup closed");
          }
        }
      };

      // 4. Open Razorpay Checkout modal
      const rzp = new window.Razorpay!(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed", response.error);
        router.push("/payment/failed");
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div>
           <Button variant="ghost" onClick={() => router.back()} className="mb-4">
             <ArrowLeft className="w-4 h-4 mr-2" /> Back
           </Button>
           <h1 className="text-display-sm text-on-surface">Secure Checkout</h1>
           <p className="text-body-md text-on-surface-variant mt-1">Review your order and complete the payment.</p>
        </div>

        {error && (
           <div className="rounded-xl border border-error bg-error/10 p-4 text-error">
             <p className="text-body-sm font-semibold">{error}</p>
           </div>
        )}

        <Card className="border-outline-variant bg-surface-container overflow-hidden space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
            <div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Lot ID</p>
              <h2 className="text-title-lg text-on-surface mt-1">lot-101</h2>
            </div>
            <Badge variant="info">Agri Checkout</Badge>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Crop</span>
              <span className="font-medium">Tomato (Grade A)</span>
            </div>
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Quantity</span>
              <span className="font-medium">2,400 kg</span>
            </div>
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Price per kg</span>
              <span className="font-medium">₹22.00</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-end">
             <div>
                <span className="text-caption font-semibold uppercase text-on-surface-variant">Total Amount</span>
             </div>
             <p className="flex items-center gap-1 text-display-md font-bold text-primary">
                 <IndianRupee className="h-6 w-6" />
                 <span className="tnum">50,000</span>
             </p>
          </div>

          <div className="rounded-lg bg-surface-container-highest p-3 flex items-start gap-3 mt-4">
            <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-caption text-on-surface-variant">
              Payments are 100% secure. Escrow ensures farmers are paid automatically upon successful delivery via Kisan Setu router.
            </p>
          </div>

          <Button
            className="w-full text-title-md flex items-center justify-center gap-2 mt-6 h-12"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" /> Pay Now
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
