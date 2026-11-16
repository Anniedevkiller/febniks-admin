"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Wallet,
  ExternalLink,
  Eye,
  Settings,
  X
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  ORDER_STATUS_LABELS,
  type Order,
  type PaymentSettings,
} from "@/lib/types";

interface OrderWithReceipt extends Order {
  receipt_signed_url?: string | null;
}

const CONFIRMED_STATUSES = [
  "paid",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export default function PaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<OrderWithReceipt[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Confirm & Reject Modal State
  const [confirmingOrder, setConfirmingOrder] = useState<OrderWithReceipt | null>(null);
  const [confirmNote, setConfirmNote] = useState("");
  const [rejectingOrder, setRejectingOrder] = useState<OrderWithReceipt | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPaymentsData = useCallback(async () => {
    try {
      const [queueRes, ordersRes, settingsRes] = await Promise.all([
        fetch("/api/admin/orders?status=awaiting_confirmation&sort=asc&receipts=1"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/payment-settings"),
      ]);
      const queueJson = await queueRes.json();
      const ordersJson = await ordersRes.json();
      const settingsJson = await settingsRes.json();

      if (queueRes.ok) setQueue(queueJson.orders || []);
      if (ordersRes.ok) setAllOrders(ordersJson.orders || []);
      if (settingsRes.ok) setPaymentSettings(settingsJson.settings || null);
    } catch {
      toast.error("Failed to load payment records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadPaymentsData();

    const supabase = createClient();
    const channel = supabase
      .channel("payments-realtime-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadPaymentsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPaymentsData]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingOrder) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${confirmingOrder.id}/confirm-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin_note: confirmNote.trim() || undefined,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Confirmation failed");

      toast.success(
        `Payment of ₦${Number(confirmingOrder.total).toLocaleString()} confirmed for #${confirmingOrder.order_number}!`
      );
      setConfirmingOrder(null);
      setConfirmNote("");
      loadPaymentsData();
    } catch (err: any) {
      toast.error(err.message || "Error confirming payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    if (!rejectNote.trim()) {
      toast.error("Admin note is required to reject payment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${rejectingOrder.id}/reject-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_note: rejectNote.trim() }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Rejection failed");

      toast.success(`Payment rejected for #${rejectingOrder.order_number}`);
      setRejectingOrder(null);
      setRejectNote("");
      loadPaymentsData();
    } catch (err: any) {
      toast.error(err.message || "Error rejecting payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute last 7 days confirmed revenue for chart
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toISOString().slice(0, 10);
    const dayRev = allOrders
      .filter(
        (o) =>
          CONFIRMED_STATUSES.includes(o.status) &&
          o.created_at.slice(0, 10) === dateKey
      )
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    return {
      name: dayNames[d.getDay()],
      revenue: dayRev,
    };
  });

  const totalConfirmedRevenue = allOrders
    .filter((o) => CONFIRMED_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const filteredTransactions = allOrders.filter((o) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      (o.payer_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Payment Confirmation & Records
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm">
              {queue.length} Awaiting Verification
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Verify manual bank transfers (oldest first) and track confirmed revenue.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings/payments"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-primary" />
            <span>Bank Account Settings</span>
          </Link>
        </div>
      </div>

      {/* MANUAL BANK TRANSFER CONFIRMATION QUEUE (Oldest First) */}
      <div className="dashboard-card !p-0 overflow-hidden border-2 border-amber-200">
        <div className="px-6 py-4 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
              {queue.length}
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">
                Awaiting Payment Confirmation Queue (Oldest First)
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Verify transfers in your bank app before confirming so the kitchen can begin.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Loading verification queue...
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
            <p className="text-sm font-bold text-gray-900">
              All caught up! No orders awaiting payment confirmation.
            </p>
            <p className="text-xs text-gray-500">
              New transfers marked paid by customers will appear here automatically in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {queue.map((order) => (
              <div
                key={order.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-amber-50/20 transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-base font-black text-gray-900 hover:text-primary"
                    >
                      Order #{order.order_number}
                    </Link>
                    <span className="text-xs text-gray-500 font-medium">
                      Customer: <strong>{order.customer_name}</strong>
                    </span>
                    {order.customer_marked_paid_at && (
                      <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                        Marked paid:{" "}
                        {new Date(order.customer_marked_paid_at).toLocaleString("en-NG", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Required Moniepoint verification prompt */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm font-bold text-gray-900">
                    Check the Moniepoint app for exactly{" "}
                    <span className="text-primary font-black">
                      ₦{Number(order.total).toLocaleString()}
                    </span>{" "}
                    from{" "}
                    <span className="underline">
                      {order.payer_name || order.customer_name}
                    </span>{" "}
                    with remark{" "}
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300">
                      {order.order_number}
                    </span>
                    .
                  </div>

                  {order.receipt_signed_url && (
                    <div className="pt-1 flex items-center gap-3">
                      <a
                        href={order.receipt_signed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Uploaded Payment Receipt (Signed URL)</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </Link>
                  <button
                    onClick={() => {
                      setRejectingOrder(order);
                      setRejectNote("");
                    }}
                    className="px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setConfirmingOrder(order);
                      setConfirmNote("");
                    }}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-green-600/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm ₦{Number(order.total).toLocaleString()}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue Chart & Bank Account Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Last 7 Days Confirmed Revenue</h3>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>
          <div className="p-6 h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                  <Bar dataKey="revenue" fill="#E63946" radius={[6, 6, 0, 0]} barSize={40}>
                    {revenueData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? "#E63946" : "#fca5a5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Active Bank Transfer Settings Card */}
        <div className="dashboard-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Receiving Bank Account
            </h3>
            {paymentSettings ? (
              <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-border">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Bank Name</p>
                  <p className="text-sm font-black text-gray-900">{paymentSettings.bank_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Account Number</p>
                  <p className="text-lg font-mono font-black text-primary tracking-wider">
                    {paymentSettings.account_number}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Account Name</p>
                  <p className="text-xs font-bold text-gray-800">{paymentSettings.account_name}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Loading bank settings...</p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Total Confirmed Revenue
            </p>
            <h2 className="text-3xl font-black text-gray-900 font-display">
              ₦{totalConfirmedRevenue.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* All Orders Payment History Table */}
      <div className="dashboard-card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900">Order Payment History</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Order # or Payer..."
              className="w-full bg-gray-100/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Order #</th>
                <th className="py-4 px-2">Customer / Payer</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-6 text-right">Date/Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.slice(0, 20).map((order) => {
                const isPaid = CONFIRMED_STATUSES.includes(order.status);
                const isRejected =
                  order.status === "payment_rejected" || order.status === "cancelled";

                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                      <Link href={`/orders/${order.id}`} className="hover:text-primary">
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          {order.customer_name}
                        </span>
                        {order.payer_name && (
                          <span className="text-[11px] text-gray-500">
                            Payer: {order.payer_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-sm font-black text-gray-900">
                        ₦{Number(order.total).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 w-fit px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-tight",
                          isPaid
                            ? "bg-green-100 text-green-700 border-green-200"
                            : isRejected
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-orange-100 text-orange-700 border-orange-200"
                        )}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isRejected ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-gray-400 font-medium">
                      {new Date(order.created_at).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Payment Dialog */}
      <AnimatePresence>
        {confirmingOrder && (
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
                  onClick={() => setConfirmingOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-gray-800 mb-5">
                Check the Moniepoint app for exactly{" "}
                <strong className="text-primary">
                  ₦{Number(confirmingOrder.total).toLocaleString()}
                </strong>{" "}
                from{" "}
                <strong>
                  {confirmingOrder.payer_name || confirmingOrder.customer_name}
                </strong>{" "}
                with remark <strong>{confirmingOrder.order_number}</strong>.
              </div>

              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Optional Note
                  </label>
                  <input
                    type="text"
                    value={confirmNote}
                    onChange={(e) => setConfirmNote(e.target.value)}
                    placeholder="e.g. Confirmed in Moniepoint"
                    className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingOrder(null)}
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
                      : `Confirm ₦${Number(confirmingOrder.total).toLocaleString()}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Payment Dialog */}
      <AnimatePresence>
        {rejectingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-900 font-display">
                  Reject Payment — #{rejectingOrder.order_number}
                </h3>
                <button
                  onClick={() => setRejectingOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Reason for Rejection (Required)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Explain why the payment could not be confirmed..."
                    className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-sm outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingOrder(null)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 disabled:opacity-60"
                  >
                    {isSubmitting ? "Rejecting..." : "Reject Payment"}
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
