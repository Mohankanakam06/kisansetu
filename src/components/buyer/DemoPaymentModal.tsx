"use client";
import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { FarmerListing, Lot, DemoPaymentRequest, DemoPaymentResponse } from "@/types";
import { DemoPaymentService } from "@/services/demoPayment";
import { Badge, Button } from "@/components/ui";
import {
  X,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FarmerListing | Lot | null;
  onSuccess?: (response: DemoPaymentResponse) => void;
}

export const DemoPaymentModal: React.FC<DemoPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  if (!isOpen || !item) return null;

  // Identify whether it's a direct FarmerListing or aggregated Lot
  const isFarmerListing = "farmer_name" in item;
  const cropName = item.crop_type;
  const unitPrice = item.price_per_kg;
  const maxAvailableQty = "quantity_kg" in item ? item.quantity_kg : item.total_quantity_kg;
  const initialQty = Math.min(100, maxAvailableQty);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [quantity, setQuantity] = useState<number>(initialQty);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [upiId, setUpiId] = useState<string>("buyer@okhdfcbank");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("GPay");
  const [cardNumber, setCardNumber] = useState<string>("4532 •••• •••• 8821");
  const [cardExpiry, setCardExpiry] = useState<string>("08/29");
  const [cardCvv, setCardCvv] = useState<string>("742");
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    "Plot 42, Krishi Wholesale Market Yard, Raipur, Chhattisgarh 492001"
  );

  // Escrow simulation states
  const [simulationStatus, setSimulationStatus] = useState<string>("Connecting to KisanSetu Escrow Vault...");
  const [progressPercent, setProgressPercent] = useState<number>(15);
  const [paymentResult, setPaymentResult] = useState<DemoPaymentResponse | null>(null);
  const [copiedTxn, setCopiedTxn] = useState<boolean>(false);

  // Calculations
  const basePrice = quantity * unitPrice;
  const escrowFee = Math.round(basePrice * 0.02); // 2% Escrow Guarantee fee
  const totalAmount = basePrice + escrowFee;

  // Reset state on open
  useEffect(() => {
    setStep(1);
    setQuantity(Math.min(100, maxAvailableQty));
    setPaymentResult(null);
    setCopiedTxn(false);
  }, [isOpen, item]);

  // Handle simulated checkout flow
  const handleAuthorizePayment = async () => {
    setStep(3);
    setProgressPercent(20);
    setSimulationStatus("Initiating handshake with KisanSetu Escrow Sandbox...");

    const payload: DemoPaymentRequest = {
      listing_id: isFarmerListing ? item.id : undefined,
      lot_id: !isFarmerListing ? item.id : undefined,
      buyer_id: "buyer-01",
      farmer_id: isFarmerListing ? (item as FarmerListing).farmer_id : undefined,
      crop_type: cropName,
      quantity_kg: quantity,
      price_per_kg: unitPrice,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      upi_id: paymentMethod === "upi" ? upiId : undefined,
      card_last4: paymentMethod === "card" ? "8821" : undefined,
    };

    // Sequential simulation timers
    setTimeout(() => {
      setProgressPercent(55);
      setSimulationStatus("Securing bank guarantee in zero-fee demo escrow vault...");
    }, 900);

    setTimeout(() => {
      setProgressPercent(85);
      setSimulationStatus("Locking farmer produce settlement & dispatching smart contract...");
    }, 1800);

    setTimeout(async () => {
      const res = await DemoPaymentService.executeDemoCheckout(payload);
      setPaymentResult(res);
      setProgressPercent(100);
      setStep(4);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#059669", "#3B82F6", "#F59E0B"],
        });
      } catch {}

      if (onSuccess) {
        onSuccess(res);
      }
    }, 2500);
  };

  const copyTransactionId = () => {
    if (paymentResult?.transaction_id) {
      navigator.clipboard.writeText(paymentResult.transaction_id);
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Sandbox Header Strip */}
        <div className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>🛡️ KisanSetu Sandbox Escrow · Demo Payment Mode</span>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Checkout Produce:</span>
              <span className="text-emerald-700 font-extrabold">{cropName}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isFarmerListing
                ? `Direct from ${(item as FarmerListing).farmer_name} (${(item as FarmerListing).district || "Raipur"})`
                : `Aggregated Wholesale Pool Lot #${item.id.substring(0, 8)}`}
            </p>
          </div>

          {/* Step Pill */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200"
                    : step > s
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* STEP 1: ORDER REVIEW */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Product Info Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Produce Unit Price</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    ₹{unitPrice.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Available</div>
                  <div className="text-sm font-bold text-emerald-800 mt-0.5">
                    {maxAvailableQty.toLocaleString()} kg
                  </div>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Order Quantity (kg)</span>
                  <span className="text-emerald-700 font-medium">Max: {maxAvailableQty} kg</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={maxAvailableQty}
                    step={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="w-24">
                    <input
                      type="number"
                      min={10}
                      max={maxAvailableQty}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(maxAvailableQty, Math.max(10, Number(e.target.value))))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Hub Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Delivery Warehouse / Mandi Gate</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter destination wholesale hub address"
                />
              </div>

              {/* Price Breakdown */}
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Produce Subtotal ({quantity} kg × ₹{unitPrice}):</span>
                  <span className="font-semibold text-slate-800">₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>KisanSetu Escrow Guarantee (2%):</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <span className="font-semibold text-slate-800">₹{escrowFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Direct Middleman Elimination:</span>
                  <span className="font-bold text-emerald-700">-₹{Math.round(basePrice * 0.15).toLocaleString()}</span>
                </div>
                <div className="border-t border-emerald-200/80 pt-2 flex justify-between items-baseline font-bold text-sm text-slate-900">
                  <span>Total Escrow Lock:</span>
                  <span className="text-base text-emerald-800 font-extrabold">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* CTAs */}
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-xl shadow-md"
              >
                <span>Select Payment Method</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select Demo Payment Channel
              </div>

              {/* Method 1: UPI */}
              <div
                onClick={() => setPaymentMethod("upi")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "upi"
                    ? "border-emerald-500 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-400/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">UPI Instant Escrow (Mock)</div>
                      <div className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    className="accent-emerald-600 h-4 w-4"
                  />
                </div>

                {paymentMethod === "upi" && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-2">
                    <div className="flex gap-2">
                      {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => {
                            setSelectedUpiApp(app);
                            setUpiId(`buyer@${app.toLowerCase()}`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            selectedUpiApp === app
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 bg-white"
                      placeholder="username@upi"
                    />
                  </div>
                )}
              </div>

              {/* Method 2: Virtual 3D Card */}
              <div
                onClick={() => setPaymentMethod("card")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-emerald-500 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-400/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Virtual Kisan Commercial Card</div>
                      <div className="text-xs text-slate-500">Corporate agri-buyer virtual debit/credit line</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="accent-emerald-600 h-4 w-4"
                  />
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60">
                    <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-900 text-white p-3.5 rounded-xl shadow-md space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center text-[10px] text-emerald-300 uppercase tracking-widest">
                        <span>KisanSetu Corporate Escrow</span>
                        <span>VISA DEMO</span>
                      </div>
                      <div className="text-sm tracking-wider font-bold">{cardNumber}</div>
                      <div className="flex justify-between text-[11px] text-slate-300 font-sans">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase">Card Holder</div>
                          <div>DEMO AGRI BUYER</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase">Expires</div>
                          <div>{cardExpiry}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase">CVV</div>
                          <div>{cardCvv}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Method 3: Farm-Gate Escrow COD */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-emerald-500 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-400/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Farm-Gate Escrow COD</div>
                      <div className="text-xs text-slate-500">Lock escrow now, release upon destination physical weighing</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-emerald-600 h-4 w-4"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-1/3 border-slate-300 text-slate-700 text-xs font-semibold py-2.5"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span>Back</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={handleAuthorizePayment}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-200" />
                  <span>Authorize ₹{totalAmount.toLocaleString()}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SIMULATED ESCROW AUTHORIZATION */}
          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"
                />
                <div className="absolute inset-0 flex items-center justify-center text-emerald-700 font-bold text-xs">
                  {progressPercent}%
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-base font-bold text-slate-900">Processing Escrow Guarantee</h4>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {simulationStatus}
                </p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs">
                <div
                  className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Simulated sandbox transaction · 256-bit SSL Escrow Protocol</span>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS & CONFIRMATION */}
          {step === 4 && paymentResult && (
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">
                  Escrow Payment Successful!
                </h4>
                <p className="text-xs text-slate-600">
                  Funds of <strong className="text-emerald-800">₹{totalAmount.toLocaleString()}</strong> are locked in KisanSetu Demo Escrow.
                </p>
              </div>

              {/* Receipt Details Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-left text-xs space-y-2.5 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Transaction ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800">{paymentResult.transaction_id}</span>
                    <button
                      onClick={copyTransactionId}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                      title="Copy transaction ID"
                    >
                      {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-800">{paymentResult.order_id}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Produce:</span>
                  <span className="font-semibold text-slate-800">{quantity} kg {cropName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Escrow Status:</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[11px] border border-emerald-200">
                    Vault Secured
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Farmer has been notified via WebSocket. Automatic payout triggers upon delivery acceptance.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Track in Orders Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 py-2.5 border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentModal;
