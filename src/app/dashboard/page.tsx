"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  MessageSquare,
  ArrowRight,
  MoreVertical,
  Filter,
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
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const salesData = [
  { name: "Mon", revenue: 4000, orders: 24 },
  { name: "Tue", revenue: 3000, orders: 18 },
  { name: "Wed", revenue: 5000, orders: 32 },
  { name: "Thu", revenue: 2780, orders: 20 },
  { name: "Fri", revenue: 6000, orders: 40 },
  { name: "Sat", revenue: 8000, orders: 55 },
  { name: "Sun", revenue: 7000, orders: 48 },
];

const bestSellers = [
  { name: "Spicy Grilled Fish", sales: 120, color: "#E63946" },
  { name: "Jollof Rice Special", sales: 98, color: "#F4A261" },
  { name: "Pepper Soup", sales: 85, color: "#9B2226" },
  { name: "Fried Yam & Sauce", sales: 70, color: "#2A9D8F" },
];

const recentOrders = [
  { id: "#ORD-7721", customer: "John Doe", items: "Grilled Tilapia, Jollof Rice", total: "₦12,500", status: "Delivered", time: "2 mins ago" },
  { id: "#ORD-7722", customer: "Jane Smith", items: "Catfish Pepper Soup", total: "₦8,000", status: "Cooking", time: "10 mins ago" },
  { id: "#ORD-7723", customer: "Robert Brown", items: "Fried Fish, Plantain", total: "₦5,500", status: "Out for delivery", time: "15 mins ago" },
  { id: "#ORD-7724", customer: "Alice Green", items: "Spicy Croaker Fish", total: "₦9,200", status: "Pending", time: "25 mins ago" },
];

export default function Dashboard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="₦2.4M" 
          change="+12.5%" 
          isUp={true} 
          icon={DollarSign} 
          iconClass="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Total Orders" 
          value="1,248" 
          change="+8.2%" 
          isUp={true} 
          icon={ShoppingBag} 
          iconClass="bg-red-100 text-primary" 
        />
        <StatCard 
          title="Active Orders" 
          value="42" 
          change="-3.1%" 
          isUp={false} 
          icon={Clock} 
          iconClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Support Tickets" 
          value="12" 
          change="+4" 
          isUp={true} 
          icon={MessageSquare} 
          iconClass="bg-orange-100 text-accent" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 dashboard-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Revenue Analytics</h3>
            <select className="bg-gray-50 border border-border text-sm rounded-lg px-3 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
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
        <div className="dashboard-card">
          <h3 className="text-lg font-bold mb-6">Best Selling Meals</h3>
          <div className="space-y-6">
            {bestSellers.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.sales} sold</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.sales / 150) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border border-border rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group">
            View Analytics
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold">Recent Orders</h3>
          <button className="text-primary text-sm font-semibold hover:underline">View All Orders</button>
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
                <th className="pb-4 px-4 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-4 px-0 text-sm text-gray-600">{order.customer}</td>
                  <td className="py-4 px-0 text-sm text-gray-500 max-w-[200px] truncate">{order.items}</td>
                  <td className="py-4 px-0 text-sm font-semibold text-gray-900">{order.total}</td>
                  <td className="py-4 px-0">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      order.status === "Delivered" && "bg-green-100 text-green-700",
                      order.status === "Cooking" && "bg-blue-100 text-blue-700",
                      order.status === "Out for delivery" && "bg-purple-100 text-purple-700",
                      order.status === "Pending" && "bg-orange-100 text-orange-700"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border transition-all">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isUp, icon: Icon, iconClass }: any) {
  return (
    <div className="dashboard-card overflow-hidden relative">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
        <div className={cn("p-3 rounded-2xl", iconClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={cn(
          "text-xs font-bold flex items-center",
          isUp ? "text-green-600" : "text-red-600"
        )}>
          {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {change}
        </span>
        <span className="text-xs text-gray-400 font-medium">vs last month</span>
      </div>
      
      {/* Subtle background decoration */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.03] text-gray-900">
        <Icon className="w-24 h-24" />
      </div>
    </div>
  );
}
