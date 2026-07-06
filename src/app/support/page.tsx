"use client";

import React from "react";
import Link from "next/link";
import { 
  HeadphonesIcon, 
  Ticket, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const supportStats = [
  { label: "Active Tickets", value: "8", icon: Ticket, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Live Chats", value: "3", icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Resolved Today", value: "15", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { label: "Avg. Response", value: "4m", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
];

const recentTickets = [
  { id: "#TKT-101", customer: "John Doe", issue: "Payment Failed", status: "Open", time: "2 mins ago" },
  { id: "#TKT-102", customer: "Jane Smith", issue: "Order Delay", status: "In Progress", time: "15 mins ago" },
  { id: "#TKT-103", customer: "Robert Brown", issue: "Refund Request", status: "Resolved", time: "1 hour ago" },
];

export default function SupportDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Customer Support</h1>
          <p className="text-gray-500 mt-1">Manage customer inquiries, complaints, and live chat sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/support/chat" 
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Open Chat Console</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supportStats.map((stat) => (
          <div key={stat.label} className="dashboard-card group hover:translate-y-[-4px]">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
            <h2 className="text-3xl font-black text-gray-900">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets Table */}
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Urgent Tickets</h3>
            <Link href="/support/tickets" className="text-primary text-xs font-bold hover:underline flex items-center gap-1 group">
              View All Tickets
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="py-4 px-6">Ticket ID</th>
                    <th className="py-4 px-2">Customer</th>
                    <th className="py-4 px-2">Issue Type</th>
                    <th className="py-4 px-2">Status</th>
                    <th className="py-4 px-6 text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900 text-sm">{tkt.id}</td>
                      <td className="py-4 px-2 text-sm text-gray-600 font-medium">{tkt.customer}</td>
                      <td className="py-4 px-2 text-sm text-gray-500 font-medium">{tkt.issue}</td>
                      <td className="py-4 px-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter",
                          tkt.status === "Open" ? "bg-orange-100 text-orange-600" : 
                          tkt.status === "In Progress" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                        )}>
                          {tkt.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-[10px] text-gray-400 font-bold uppercase">{tkt.time}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Canned Responses / Knowledge Base */}
        <div className="space-y-6">
           <div className="dashboard-card bg-sidebar text-white shadow-xl shadow-sidebar/20">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                 <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left text-sm font-medium transition-colors flex items-center justify-between group">
                    <span>Email Broadcast</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                 </button>
                 <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left text-sm font-medium transition-colors flex items-center justify-between group">
                    <span>SMS Notifications</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                 </button>
                 <button className="w-full p-3 bg-accent text-white rounded-xl text-left text-sm font-bold transition-all hover:bg-accent/90 flex items-center justify-between group">
                    <span>New Ticket</span>
                    <Plus className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <div className="dashboard-card">
              <h3 className="font-bold text-gray-900 mb-4">Admin Activity</h3>
              <div className="space-y-4">
                  <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Support Agent A</p>
                        <p className="text-[10px] text-gray-500 font-medium">Replied to #TKT-102</p>
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">System Bot</p>
                        <p className="text-[10px] text-gray-500 font-medium">Assigned #TKT-101 to Admin</p>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
