"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Utensils, 
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const orders = [
  { id: "#ORD-7721", customer: "John Doe", email: "john@example.com", items: "Grilled Tilapia, Jollof Rice", total: "₦12,500", status: "Delivered", payment: "Paid", time: "26 Mar, 12:45 PM" },
  { id: "#ORD-7722", customer: "Jane Smith", email: "jane@example.com", items: "Catfish Pepper Soup", total: "₦8,000", status: "Cooking", payment: "Paid", time: "26 Mar, 01:10 PM" },
  { id: "#ORD-7723", customer: "Robert Brown", email: "robert@example.com", items: "Fried Fish, Plantain", total: "₦5,500", status: "Out for delivery", payment: "Paid", time: "26 Mar, 01:15 PM" },
  { id: "#ORD-7724", customer: "Alice Green", email: "alice@example.com", items: "Spicy Croaker Fish", total: "₦9,200", status: "Pending", payment: "Pending", time: "26 Mar, 01:25 PM" },
  { id: "#ORD-7725", customer: "Samuel Ade", email: "sam@example.com", items: "Jollof Rice, Chicken", total: "₦6,500", status: "Ready", payment: "Paid", time: "26 Mar, 01:30 PM" },
  { id: "#ORD-7726", customer: "Grace Opara", email: "grace@example.com", items: "Grilled Fish, Yam Fries", total: "₦11,000", status: "Pending", payment: "Failed", time: "26 Mar, 01:35 PM" },
  { id: "#ORD-7727", customer: "David Kalu", email: "david@example.com", items: "Fisherman Soup", total: "₦15,000", status: "Delivered", payment: "Paid", time: "26 Mar, 11:20 AM" },
  { id: "#ORD-7728", customer: "Mary Eze", email: "mary@example.com", items: "Fried Croaker, Salad", total: "₦8,500", status: "Cooking", payment: "Paid", time: "26 Mar, 01:40 PM" },
];

const statusStyles: Record<string, string> = {
  "Pending": "bg-orange-100 text-orange-700 border-orange-200",
  "Cooking": "bg-blue-100 text-blue-700 border-blue-200",
  "Ready": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Out for delivery": "bg-purple-100 text-purple-700 border-purple-200",
  "Delivered": "bg-green-100 text-green-700 border-green-200",
};

const statusIcons: Record<string, any> = {
  "Pending": Clock,
  "Cooking": Utensils,
  "Ready": CheckCircle2,
  "Out for delivery": Truck,
  "Delivered": CheckCircle2,
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Orders");

  const tabs = ["All Orders", "Pending", "Preparing", "Out for Delivery", "Completed"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all customer orders in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "New Orders", value: "12", color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Preparing", value: "8", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "On the way", value: "5", color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Delivered today", value: "34", color: "text-green-600", bg: "bg-green-50" },
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
          <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  activeTab === tab 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Name..."
              className="w-full bg-gray-50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="py-4 px-2">Payment</th>
                <th className="py-4 px-2">Order Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{order.id}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{order.time}</span>
                      </div>
                    </td>
                    <td className="py-5 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-border">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{order.customer}</span>
                          <span className="text-xs text-gray-500">{order.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-2">
                      <p className="text-sm text-gray-600 max-w-[180px] truncate">{order.items}</p>
                    </td>
                    <td className="py-5 px-2">
                      <span className="text-sm font-bold text-gray-900">{order.total}</span>
                    </td>
                    <td className="py-5 px-2">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter",
                        order.payment === "Paid" ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
                      )}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="py-5 px-2">
                      <div className={cn(
                        "flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-tight shadow-sm transition-all",
                        statusStyles[order.status]
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.status}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border transition-all text-gray-400 hover:text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border transition-all text-gray-400 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900">1 to 8</span> of <span className="text-gray-900">24</span> results
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={cn(
                    "w-8 h-8 text-sm font-semibold rounded-lg transition-all",
                    page === 1 ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="p-2 border border-border rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
