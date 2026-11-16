"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CreditCard,
  ArrowRight,
  Eye,
  Download
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const CONFIRMED_STATUSES: OrderStatus[] = [
  "paid",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const BAR_COLORS = ["#E63946", "#F4A261", "#9B2226", "#2A9D8F"];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (res.ok) {
        setOrders(json.orders || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadDashboard();

    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadDashboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard]);

  // Real Metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysOrders = orders.filter(
    (o) => o.created_at && o.created_at.slice(0, 10) === todayStr
  );
  const todaysConfirmedRevenue = todaysOrders
    .filter((o) => CONFIRMED_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const awaitingConfirmationOrders = orders.filter(
    (o) => o.status === "awaiting_confirmation"
  );

  const activeKitchenOrders = orders.filter((o) =>
    ["paid", "preparing", "ready", "out_for_delivery"].includes(o.status)
  );

  // Chart Data (Last 7 or 30 days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const salesData = Array.from({ length: rangeDays }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (rangeDays - 1 - i));
    const dateKey = d.toISOString().slice(0, 10);
    const matching = orders.filter(
      (o) => o.created_at && o.created_at.slice(0, 10) === dateKey
    );
    const rev = matching
      .filter((o) => CONFIRMED_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    return {
      name:
        rangeDays === 7
          ? dayNames[d.getDay()]
          : `${d.getDate()}/${d.getMonth() + 1}`,
      revenue: rev,
      orders: matching.length,
    };
  });

  // Best Selling Meals from confirmed order_items
  const mealCounts = new Map<string, number>();
  orders
    .filter((o) => CONFIRMED_STATUSES.includes(o.status))
    .forEach((o) => {
      (o.order_items || []).forEach((item) => {
        mealCounts.set(
          item.meal_name,
          (mealCounts.get(item.meal_name) || 0) + Number(item.quantity || 1)
        );
      });
    });

  const bestSellers = Array.from(mealCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, sales], idx) => ({
      name,
      sales,
      color: BAR_COLORS[idx % BAR_COLORS.length],
    }));

  const maxSales = Math.max(1, ...bestSellers.map((b) => b.sales));
  const latestOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, Admin! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {awaitingConfirmationOrders.length > 0 && (
            <Link
              href="/payments"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>{awaitingConfirmationOrders.length} Awaiting Confirmation</span>
            </Link>
          )}
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Confirmed Revenue" 
          value={`₦${todaysConfirmedRevenue.toLocaleString()}`} 
          subtitle="Verified paid orders today" 
          icon={DollarSign} 
          iconClass="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Today's Orders" 
          value={String(todaysOrders.length)} 
          subtitle={`${orders.length} total all-time`} 
          icon={ShoppingBag} 
          iconClass="bg-red-100 text-primary" 
        />
        <StatCard 
          title="Awaiting Confirmation" 
          value={String(awaitingConfirmationOrders.length)} 
          subtitle="Needs bank check" 
          icon={CreditCard} 
          iconClass="bg-orange-100 text-accent" 
        />
        <StatCard 
          title="Active in Kitchen / Transit" 
          value={String(activeKitchenOrders.length)} 
          subtitle="Paid, preparing, ready & transit" 
          icon={Clock} 
          iconClass="bg-blue-100 text-blue-600" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 dashboard-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Confirmed Revenue Trend</h3>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value) as 7 | 30)}
              className="bg-gray-50 border border-border text-sm rounded-lg px-3 py-1 outline-none"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E63946" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E63946" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#E63946" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="dashboard-card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-6">Best Selling Meals</h3>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">
                No confirmed meal sales recorded yet.
              </p>
            ) : (
              <div className="space-y-6">
                {bestSellers.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 truncate max-w-[180px]">
                        {item.name}
                      </span>
                      <span className="text-gray-500">{item.sales} sold</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.sales / maxSales) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/menu"
            className="w-full mt-8 py-3 border border-border rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group"
          >
            Manage Menu
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Latest Orders Section */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold">Latest Orders</h3>
          <Link href="/orders" className="text-primary text-sm font-semibold hover:underline">
            View All Orders
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-border">
                <th className="pb-4 px-4 font-normal">Order ID</th>
                <th className="pb-4 px-0 font-normal">Customer</th>
                <th className="pb-4 px-0 font-normal">Items</th>
                <th className="pb-4 px-0 font-normal">Amount</th>
                <th className="pb-4 px-0 font-normal">Status</th>
                <th className="pb-4 px-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                    Loading latest orders...
                  </td>
                </tr>
              ) : latestOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                latestOrders.map((order) => {
                  const itemsSummary =
                    order.order_items && order.order_items.length > 0
                      ? order.order_items
                          .map((i) => `${i.meal_name} (x${i.quantity})`)
                          .join(", ")
                      : "—";

                  return (
                    <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900">
                        <Link href={`/orders/${order.id}`} className="hover:text-primary">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="py-4 px-0 text-sm text-gray-600">{order.customer_name}</td>
                      <td className="py-4 px-0 text-sm text-gray-500 max-w-[220px] truncate">
                        {itemsSummary}
                      </td>
                      <td className="py-4 px-0 text-sm font-semibold text-gray-900">
                        ₦{Number(order.total).toLocaleString()}
                      </td>
                      <td className="py-4 px-0">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            order.status === "delivered" && "bg-green-100 text-green-700",
                            order.status === "paid" && "bg-emerald-100 text-emerald-700",
                            order.status === "preparing" && "bg-blue-100 text-blue-700",
                            order.status === "ready" && "bg-cyan-100 text-cyan-700",
                            order.status === "out_for_delivery" && "bg-purple-100 text-purple-700",
                            order.status === "awaiting_confirmation" && "bg-amber-100 text-amber-800",
                            order.status === "pending" && "bg-gray-100 text-gray-700",
                            (order.status === "cancelled" ||
                              order.status === "payment_rejected") &&
                              "bg-red-100 text-red-700"
                          )}
                        >
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 hover:bg-white rounded-lg border border-transparent hover:border-border text-xs font-bold text-gray-600 hover:text-primary transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Open</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, iconClass }: any) {
  return (
    <div className="dashboard-card overflow-hidden relative">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
        <div className={cn("p-3 rounded-2xl", iconClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs font-bold flex items-center text-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          Live
        </span>
        <span className="text-xs text-gray-400 font-medium">{subtitle}</span>
      </div>
      
      {/* Subtle background decoration */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.03] text-gray-900">
        <Icon className="w-24 h-24" />
      </div>
    </div>
  );
}
