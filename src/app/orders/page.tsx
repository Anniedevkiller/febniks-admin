"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Utensils, 
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  XCircle,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  awaiting_confirmation: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  preparing: "bg-blue-100 text-blue-700 border-blue-200",
  ready: "bg-cyan-100 text-cyan-700 border-cyan-200",
  out_for_delivery: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  payment_rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusIcons: Record<OrderStatus, any> = {
  pending: Clock,
  awaiting_confirmation: CreditCard,
  paid: CheckCircle2,
  preparing: Utensils,
  ready: CheckCircle2,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  payment_rejected: AlertCircle,
};

const filterTabs: { label: string; value: "all" | OrderStatus }[] = [
  { label: "All Orders", value: "all" },
  { label: "Awaiting Confirmation", value: "awaiting_confirmation" },
  { label: "Paid", value: "paid" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Pending", value: "pending" },
  { label: "Rejected / Cancelled", value: "payment_rejected" },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>(
    (searchParams.get("status") as OrderStatus) || "all"
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load orders");
      setOrders(json.orders || []);
    } catch (err: any) {
      toast.error(err.message || "Error loading orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const supabase = createClient();
    const channel = supabase
      .channel("orders-realtime-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeTab === "all"
        ? true
        : activeTab === "payment_rejected"
        ? order.status === "payment_rejected" || order.status === "cancelled"
        : order.status === activeTab;

    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.order_number.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      (order.customer_email || "").toLowerCase().includes(q) ||
      (order.customer_phone || "").toLowerCase().includes(q) ||
      (order.payer_name || "").toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Live Stat Counters
  const todayStr = new Date().toISOString().slice(0, 10);
  const awaitingConfirmationCount = orders.filter(
    (o) => o.status === "awaiting_confirmation"
  ).length;
  const preparingCount = orders.filter(
    (o) => o.status === "paid" || o.status === "preparing" || o.status === "ready"
  ).length;
  const onTheWayCount = orders.filter(
    (o) => o.status === "out_for_delivery"
  ).length;
  const deliveredTodayCount = orders.filter(
    (o) => o.status === "delivered" && o.created_at.slice(0, 10) === todayStr
  ).length;

  const exportCsv = () => {
    const headers = [
      "Order Number",
      "Customer",
      "Email",
      "Phone",
      "Status",
      "Total (NGN)",
      "Created At",
    ];
    const rows = filteredOrders.map((o) => [
      o.order_number,
      `"${(o.customer_name || "").replace(/"/g, '""')}"`,
      o.customer_email || "",
      o.customer_phone || "",
      o.status,
      o.total,
      o.created_at,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `febniks-orders-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all customer orders in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          {awaitingConfirmationCount > 0 && (
            <Link
              href="/payments"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>{awaitingConfirmationCount} Awaiting Verification</span>
            </Link>
          )}
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Awaiting Confirmation", value: String(awaitingConfirmationCount), color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Paid / In Kitchen", value: String(preparingCount), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "On the way", value: String(onTheWayCount), color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Delivered today", value: String(deliveredTodayCount), color: "text-green-600", bg: "bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className={cn("p-4 rounded-2xl border border-transparent", stat.bg)}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
            <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="dashboard-card overflow-hidden !p-0">
        {/* Table Filters/Tabs */}
        <div className="px-6 py-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl w-fit max-w-full overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                  activeTab === tab.value 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order # or Customer..."
              className="w-full bg-gray-50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-2">Customer</th>
                <th className="py-4 px-2">Menu Items</th>
                <th className="py-4 px-2">Total Amount</th>
                <th className="py-4 px-2">Payer / Proof</th>
                <th className="py-4 px-2">Order Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400 font-medium">
                    Loading live orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400 font-medium">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  const itemsSummary =
                    order.order_items && order.order_items.length > 0
                      ? order.order_items
                          .map((i) => `${i.meal_name} (x${i.quantity})`)
                          .join(", ")
                      : "—";

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="py-5 px-6">
                        <Link href={`/orders/${order.id}`} className="flex flex-col hover:text-primary">
                          <span className="font-bold text-gray-900 group-hover:text-primary">
                            #{order.order_number}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleString("en-NG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </Link>
                      </td>
                      <td className="py-5 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-border shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {order.customer_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.customer_phone || order.customer_email || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-2">
                        <p className="text-sm text-gray-600 max-w-[200px] truncate" title={itemsSummary}>
                          {itemsSummary}
                        </p>
                      </td>
                      <td className="py-5 px-2">
                        <span className="text-sm font-bold text-gray-900">
                          ₦{Number(order.total).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-5 px-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-700">
                            {order.payer_name || "—"}
                          </span>
                          {order.payment_proof_path ? (
                            <span className="text-[10px] font-bold text-emerald-600">
                              Receipt Attached
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">No Receipt</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-2">
                        <div className={cn(
                          "flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-tight shadow-sm transition-all",
                          statusStyles[order.status]
                        )}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-primary hover:text-white rounded-lg border border-border transition-all text-xs font-bold text-gray-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Showing{" "}
            <span className="text-gray-900">
              {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, filteredOrders.length)}
            </span>{" "}
            of <span className="text-gray-900">{filteredOrders.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-700 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
