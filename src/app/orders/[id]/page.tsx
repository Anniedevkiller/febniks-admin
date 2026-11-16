"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Utensils,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  ORDER_STATUS_LABELS,
  VALID_FULFILLMENT_TRANSITIONS,
  type Order,
  type OrderStatus,
} from "@/lib/types";

const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "pending", label: "Order Placed", desc: "Customer created the order" },
  {
    status: "awaiting_confirmation",
    label: "Awaiting Confirmation",
    desc: "Customer marked bank transfer as paid",
  },
  { status: "paid", label: "Payment Confirmed", desc: "Verified by admin; ready for kitchen" },
  { status: "preparing", label: "Preparing in Kitchen", desc: "Chefs are cooking the order" },
  { status: "ready", label: "Order Ready", desc: "Packed and ready for dispatch/pickup" },
  { status: "out_for_delivery", label: "Out for Delivery", desc: "Rider is on the way to customer" },
  { status: "delivered", label: "Delivered", desc: "Order completed" },
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [confirmedByProfile, setConfirmedByProfile] = useState<{
    full_name?: string | null;
    email?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm / Reject / Status Dialogs
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmNote, setConfirmNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch order");
      setOrder(json.order);
      setReceiptUrl(json.receipt_signed_url || null);
      setConfirmedByProfile(json.confirmed_by_profile || null);
    } catch (err: any) {
      toast.error(err.message || "Error loading order details");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
    if (!orderId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`order-detail-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          fetchOrderDetail();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, fetchOrderDetail]);

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_note: confirmNote.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to confirm payment");
      setOrder(json.order);
      setShowConfirmModal(false);
      setConfirmNote("");
      toast.success(
        json.email_sent
          ? "Payment confirmed & confirmation email sent!"
          : "Payment confirmed!"
      );
      fetchOrderDetail();
    } catch (err: any) {
      toast.error(err.message || "Could not confirm payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!rejectNote.trim()) {
      toast.error("Please provide a reason for rejecting this payment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/reject-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_note: rejectNote.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reject payment");
      setOrder(json.order);
      setShowRejectModal(false);
      setRejectNote("");
      toast.success("Payment rejected and customer notified.");
      fetchOrderDetail();
    } catch (err: any) {
      toast.error(err.message || "Could not reject payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransitionStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    if (
      nextStatus === "cancelled" &&
      !window.confirm(`Are you sure you want to cancel Order #${order.order_number}?`)
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          admin_note: statusNote.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      setOrder(json.order);
      setStatusNote("");
      toast.success(
        `Order #${order.order_number} updated to ${ORDER_STATUS_LABELS[nextStatus]}!`
      );
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <div className="h-12 w-64 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const allowedTransitions = VALID_FULFILLMENT_TRANSITIONS[order.status] || [];
  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.status === order.status
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="p-3 bg-white hover:bg-gray-50 border border-border text-gray-600 rounded-2xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
                Order #{order.order_number}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Placed on{" "}
              {new Date(order.created_at).toLocaleString("en-NG", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrderDetail}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors w-fit"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Manual Bank Transfer Verification Banner (when status === 'awaiting_confirmation') */}
      {order.status === "awaiting_confirmation" && (
        <div className="dashboard-card bg-amber-50/90 border-2 border-amber-300 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                  Manual Bank Transfer Verification Required
                </span>
                <p className="text-base sm:text-lg font-black text-gray-900 mt-1">
                  Check the Moniepoint app for exactly{" "}
                  <span className="text-primary">
                    ₦{Number(order.total).toLocaleString()}
                  </span>{" "}
                  from{" "}
                  <span className="underline decoration-amber-500">
                    {order.payer_name || order.customer_name}
                  </span>{" "}
                  with remark{" "}
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300">
                    {order.order_number}
                  </span>
                  .
                </p>
                {order.customer_marked_paid_at && (
                  <p className="text-xs text-gray-600 font-medium mt-1">
                    Customer marked paid at:{" "}
                    {new Date(order.customer_marked_paid_at).toLocaleString("en-NG")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isSubmitting}
                className="px-5 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Reject Payment
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items, Fulfillment Controls & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items & Read-Only Totals */}
          <div className="dashboard-card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Order Items</h3>
              <span className="text-xs text-gray-500 font-semibold">
                {order.order_items?.length || 0} item(s) • Prices locked
              </span>
            </div>

            <div className="divide-y divide-border">
              {(order.order_items || []).map((item, idx) => (
                <div
                  key={item.id || `${item.meal_name}-${idx}`}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.meal_name}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      ₦{Number(item.unit_price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-black text-gray-900">
                    ₦{Number(item.unit_price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50/60 border-t border-border space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">
                  ₦{Number(order.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold">
                  ₦{Number(order.delivery_fee).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">
                  ₦{Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Kitchen & Fulfillment Controls */}
          <div className="dashboard-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Kitchen & Fulfillment Actions</h3>
                <p className="text-xs text-gray-500 font-medium">
                  The kitchen only starts once an order is marked <strong>Paid</strong>. Every transition emails the customer.
                </p>
              </div>
              <Utensils className="w-5 h-5 text-primary" />
            </div>

            {allowedTransitions.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-50 border border-border text-xs font-semibold text-gray-500">
                No further fulfillment transitions available for status{" "}
                <strong>{ORDER_STATUS_LABELS[order.status]}</strong>.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Optional Note to Customer (Included in Email)
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Rider Musa (+234...) is on his way with your order"
                    className="w-full bg-gray-50 border border-border rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {allowedTransitions.map((nextStatus) => {
                    const isCancel = nextStatus === "cancelled";
                    return (
                      <button
                        key={nextStatus}
                        disabled={isSubmitting}
                        onClick={() => handleTransitionStatus(nextStatus)}
                        className={cn(
                          "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50",
                          isCancel
                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"
                            : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark"
                        )}
                      >
                        {isCancel ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        <span>Mark as {ORDER_STATUS_LABELS[nextStatus]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Status Timeline */}
          <div className="dashboard-card">
            <h3 className="font-bold text-gray-900 mb-6">Order Status Timeline</h3>

            {(order.status === "cancelled" || order.status === "payment_rejected") && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black uppercase text-red-700">
                    Order {ORDER_STATUS_LABELS[order.status]}
                  </p>
                  {order.admin_note && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      Note: {order.admin_note}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {TIMELINE_STEPS.map((step, index) => {
                const isCompleted =
                  currentStepIndex >= index &&
                  order.status !== "cancelled" &&
                  order.status !== "payment_rejected";
                const isCurrent = order.status === step.status;

                return (
                  <div key={step.status} className="flex items-start gap-4 relative">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all",
                        isCompleted
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white border-gray-300 text-gray-400",
                        isCurrent && "ring-4 ring-green-100"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-bold",
                          isCompleted ? "text-gray-900" : "text-gray-400"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                      {step.status === "paid" && order.confirmed_at && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                          Confirmed{" "}
                          {new Date(order.confirmed_at).toLocaleString("en-NG")}
                          {confirmedByProfile
                            ? ` by ${
                                confirmedByProfile.full_name ||
                                confirmedByProfile.email
                              }`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details & Private Payment Receipt */}
        <div className="space-y-6">
          {/* Customer & Delivery Details */}
          <div className="dashboard-card space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-border pb-3">
              Customer & Delivery
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Customer Name</p>
                  <p className="font-bold text-gray-900">{order.customer_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Phone</p>
                  <p className="font-semibold text-gray-800">{order.customer_phone || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Email</p>
                  <p className="font-semibold text-gray-800 break-all">
                    {order.customer_email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Fulfillment</p>
                  <p className="font-bold text-gray-900 uppercase text-xs">
                    {order.fulfillment || "Delivery"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Delivery Address</p>
                  <p className="font-medium text-gray-800">
                    {order.delivery_address || "Pickup / Not specified"}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">Customer Note</p>
                    <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-border mt-1">
                      {order.notes}
                    </p>
                  </div>
                </div>
              )}

              {order.admin_note && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-primary">Admin Note</p>
                    <p className="text-xs text-gray-800 bg-primary/5 p-2.5 rounded-lg border border-primary/20 mt-1">
                      {order.admin_note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Proof / Receipt Card (Private Bucket Signed URL) */}
          <div className="dashboard-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-gray-900">Transfer & Receipt</h3>
              <CreditCard className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Sender / Payer Name:</span>
                <span className="font-bold text-gray-900">
                  {order.payer_name || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Marked Paid At:</span>
                <span className="font-semibold text-gray-800">
                  {order.customer_marked_paid_at
                    ? new Date(order.customer_marked_paid_at).toLocaleString("en-NG")
                    : "—"}
                </span>
              </div>
            </div>

            {receiptUrl ? (
              <div className="space-y-3 pt-2">
                <div className="rounded-2xl overflow-hidden border border-border bg-gray-50 max-h-80 flex items-center justify-center">
                  <img
                    src={receiptUrl}
                    alt={`Payment proof for #${order.order_number}`}
                    className="w-full h-auto max-h-80 object-contain"
                  />
                </div>
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Receipt (Signed URL, 5m expiry)</span>
                </a>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400 font-medium">
                {order.payment_proof_path
                  ? "Could not generate signed URL for receipt."
                  : "No payment receipt image uploaded for this order."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Payment Dialog */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-900 font-display">
                  Confirm Bank Transfer
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-gray-800 mb-5">
                Check the Moniepoint app for exactly{" "}
                <strong className="text-primary">
                  ₦{Number(order.total).toLocaleString()}
                </strong>{" "}
                from{" "}
                <strong>{order.payer_name || order.customer_name}</strong> with
                remark <strong>{order.order_number}</strong>.
              </div>

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Optional Admin Note
                  </label>
                  <input
                    type="text"
                    value={confirmNote}
                    onChange={(e) => setConfirmNote(e.target.value)}
                    placeholder="e.g. Verified in Moniepoint"
                    className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-600/20 disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Confirming..."
                      : `Confirm ₦${Number(order.total).toLocaleString()}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Payment Dialog */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-900 font-display">
                  Reject Payment
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-500 font-medium mb-4">
                Provide a clear note explaining why the transfer of{" "}
                <strong>₦{Number(order.total).toLocaleString()}</strong> for{" "}
                <strong>#{order.order_number}</strong> could not be verified. This note will be emailed to the customer.
              </p>

              <form onSubmit={handleRejectPayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="e.g. Transfer not received in our Moniepoint account after 30 minutes."
                    className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-sm outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 disabled:opacity-60"
                  >
                    {isSubmitting ? "Rejecting..." : "Reject & Email Customer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
