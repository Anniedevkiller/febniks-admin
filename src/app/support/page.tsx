"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Ticket, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { SupportTicket } from "@/lib/types";

function formatRelativeTime(dateString: string): string {
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "Recent";
  }
}

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support/tickets");
      const data = await res.json();
      if (res.ok && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets overview:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const supabase = createClient();
    const channel = supabase
      .channel("support-overview-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTickets]);

  // Derived stats
  const activeCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;

  const liveChatCount = tickets.filter(
    (t) => t.status === "in_progress"
  ).length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const resolvedTodayCount = tickets.filter((t) => {
    if (t.status !== "resolved") return false;
    const updatedAt = new Date(t.updated_at);
    return updatedAt >= todayStart;
  }).length;

  // Urgent tickets: open/in_progress, sorted by priority (high first) then last_message_at
  const urgentTickets = [...tickets]
    .filter((t) => t.status === "open" || t.status === "in_progress")
    .sort((a, b) => {
      const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (diff !== 0) return diff;
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    })
    .slice(0, 6);

  const stats = [
    { label: "Active Tickets", value: activeCount.toString(), icon: Ticket, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Live Chats", value: liveChatCount.toString(), icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Resolved Today", value: resolvedTodayCount.toString(), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Avg. Response", value: "< 15m", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
  ];

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
        {stats.map((stat) => (
          <div key={stat.label} className="dashboard-card group hover:translate-y-[-4px]">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
            <h2 className="text-3xl font-black text-gray-900">
              {loading ? "..." : stat.value}
            </h2>
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
                  <th className="py-4 px-2">Issue / Subject</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-6 text-right">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Loading tickets...</span>
                      </div>
                    </td>
                  </tr>
                ) : urgentTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                      No active urgent tickets.
                    </td>
                  </tr>
                ) : (
                  urgentTickets.map((t) => {
                    const customerName = t.profiles?.full_name || t.profiles?.email || "Customer";
                    return (
                      <tr 
                        key={t.id} 
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <Link href={`/support/chat?ticketId=${t.id}`} className="font-bold text-primary hover:underline text-xs">
                            {t.ticket_number}
                          </Link>
                        </td>
                        <td className="py-4 px-2">
                          <p className="text-xs font-bold text-gray-800 truncate max-w-[140px]">{customerName}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{t.profiles?.email || ""}</p>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">{t.subject}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border",
                            t.status === "open" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            t.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-green-50 text-green-700 border-green-200"
                          )}>
                            {t.status === "open" && <AlertCircle className="w-2.5 h-2.5" />}
                            {t.status === "in_progress" && <Clock className="w-2.5 h-2.5" />}
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-xs text-gray-400 font-medium">
                          {formatRelativeTime(t.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="dashboard-card bg-sidebar text-white shadow-xl shadow-sidebar/20">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/support/tickets"
                className="w-full p-3 bg-accent text-white rounded-xl text-left text-sm font-bold transition-all hover:bg-accent/90 flex items-center justify-between group"
              >
                <span>Manage Tickets</span>
                <Plus className="w-4 h-4" />
              </Link>
              <Link
                href="/support/chat"
                className="w-full p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-left text-sm font-bold transition-all flex items-center justify-between group"
              >
                <span>Live Chat Support</span>
                <MessageCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="font-bold text-gray-900 mb-4">Ticket Status Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <span className="font-bold text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Open
                </span>
                <span className="font-black text-gray-900">{tickets.filter(t => t.status === "open").length}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <span className="font-bold text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  In Progress
                </span>
                <span className="font-black text-gray-900">{tickets.filter(t => t.status === "in_progress").length}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <span className="font-bold text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Resolved
                </span>
                <span className="font-black text-gray-900">{tickets.filter(t => t.status === "resolved").length}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="font-bold text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Closed
                </span>
                <span className="font-black text-gray-900">{tickets.filter(t => t.status === "closed").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
