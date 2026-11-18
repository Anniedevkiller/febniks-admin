"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock, 
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Order, Meal, Category, OrderStatus } from "@/lib/types";

const CONFIRMED_STATUSES: OrderStatus[] = [
  "paid",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const PIE_COLORS = ["#E63946", "#F4A261", "#9B2226", "#2A9D8F", "#264653"];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadAnalytics = useCallback(async () => {
    const [ordersRes, mealsRes, catRes] = await Promise.all([
      fetch("/api/admin/orders"),
      fetch("/api/admin/meals"),
      fetch("/api/admin/categories"),
    ]);
    if (ordersRes.ok) {
      const j = await ordersRes.json();
      setOrders(j.orders || []);
    }
    if (mealsRes.ok) {
      const j = await mealsRes.json();
      setMeals(j.meals || []);
    }
    if (catRes.ok) {
      const j = await catRes.json();
      setCategories(j.categories || []);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadAnalytics();

    const supabase = createClient();
    const channel = supabase
      .channel("analytics-realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAnalytics]);

  const confirmedOrders = orders.filter((o) =>
    CONFIRMED_STATUSES.includes(o.status)
  );

  // 1. Last 7 Days Revenue & Orders AreaChart
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const performanceData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toISOString().slice(0, 10);
    const dayOrders = confirmedOrders.filter(
      (o) => o.created_at && o.created_at.slice(0, 10) === dateKey
    );
    return {
      name: dayNames[d.getDay()],
      revenue: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0),
      orders: dayOrders.length,
    };
  });

  // 2. Category Distribution from real order_items
  const mealCategoryMap = new Map<string, string>();
  meals.forEach((m) => {
    const catName =
      m.categories?.name ||
      categories.find((c) => c.id === m.category_id)?.name ||
      "Uncategorized";
    mealCategoryMap.set(m.id, catName);
    mealCategoryMap.set(m.name, catName);
  });

  const categoryTotals = new Map<string, number>();
  confirmedOrders.forEach((o) => {
    (o.order_items || []).forEach((item) => {
      const cat =
        (item.meal_id && mealCategoryMap.get(item.meal_id)) ||
        mealCategoryMap.get(item.meal_name) ||
        "Other";
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + Number(item.quantity || 1));
    });
  });

  const categoryData = Array.from(categoryTotals.entries()).map(
    ([name, value], idx) => ({
      name,
      value,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    })
  );

  // 3. Peak Order Hours from real orders
  const hourBuckets = [
    { label: "08 AM", start: 8, end: 10 },
    { label: "10 AM", start: 10, end: 12 },
    { label: "12 PM", start: 12, end: 14 },
    { label: "02 PM", start: 14, end: 16 },
    { label: "04 PM", start: 16, end: 18 },
    { label: "06 PM", start: 18, end: 20 },
    { label: "08 PM", start: 20, end: 22 },
    { label: "10 PM", start: 22, end: 24 },
  ];
  const peakTimeData = hourBuckets.map((b) => ({
    time: b.label,
    orders: orders.filter((o) => {
      const h = new Date(o.created_at).getHours();
      return h >= b.start && h < b.end;
    }).length,
  }));

  // 4. Real KPIs from user orders
  const avgOrderValue =
    confirmedOrders.length > 0
      ? Math.round(
          confirmedOrders.reduce((s, o) => s + Number(o.total || 0), 0) /
            confirmedOrders.length
        )
      : 0;

  const customerOrderCounts = new Map<string, number>();
  orders.forEach((o) => {
    const key = o.user_id || o.customer_email || o.customer_phone || o.id;
    customerOrderCounts.set(key, (customerOrderCounts.get(key) || 0) + 1);
  });
  const totalUniqueCustomers = customerOrderCounts.size;
  const repeatCustomers = Array.from(customerOrderCounts.values()).filter(
    (c) => c > 1
  ).length;
  const retentionRate =
    totalUniqueCustomers > 0
      ? Math.round((repeatCustomers / totalUniqueCustomers) * 100)
      : 0;

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const fulfillmentRate =
    orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0;

  const topCategory =
    categoryData.length > 0
      ? [...categoryData].sort((a, b) => b.value - a.value)[0].name
      : "No sales yet";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Data Analytics</h1>
          <p className="text-gray-500 mt-1">
            Live sales performance and customer behavior computed from Supabase orders.
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Area Chart */}
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-gray-900">7-Day Revenue & Order Growth</h3>
            <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              {confirmedOrders.length} CONFIRMED ORDERS
            </div>
          </div>
          <div className="p-6 h-[400px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E63946" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E63946" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#E63946" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="orders" stroke="#9B2226" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Category Share - Pie Chart */}
        <div className="dashboard-card flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-gray-900 mb-6 w-full text-left">Category Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium">
                No confirmed category sales yet.
              </p>
            ) : mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
            )}
          </div>
          <div className="mt-4 pt-6 border-t border-border w-full flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Most Popular</p>
              <p className="text-lg font-black text-gray-900">{topCategory}</p>
            </div>
            <div className="p-2 bg-red-100 text-primary rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Times Bar Chart */}
        <div className="dashboard-card">
          <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Peak Order Hours
          </h3>
          <div className="h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakTimeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip cursor={{fill: 'rgba(230, 57, 70, 0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="orders" fill="#E63946" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <KPICard
            title="Customer Retention"
            value={`${retentionRate}%`}
            trend={`${repeatCustomers} repeat`}
            description="Returning customers with 2+ orders"
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Avg. Order Value"
            value={`₦${avgOrderValue.toLocaleString()}`}
            trend="Confirmed"
            description="Average spent per paid order"
            icon={ShoppingBag}
            color="green"
          />
          <KPICard
            title="Delivery Rate"
            value={`${fulfillmentRate}%`}
            trend={`${deliveredCount} delivered`}
            description="Orders completed & delivered"
            icon={ArrowUpRight}
            color="purple"
          />
          <KPICard
            title="Ordering Customers"
            value={String(totalUniqueCustomers)}
            trend={`${orders.length} orders`}
            description="Total unique customers"
            icon={Users}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, description, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="dashboard-card">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2 mb-2">
        <h4 className="text-2xl font-black text-gray-900">{value}</h4>
        <span className="text-[10px] font-black text-green-600">{trend}</span>
      </div>
      <p className="text-xs text-gray-500 font-medium leading-tight">{description}</p>
    </div>
  );
}
