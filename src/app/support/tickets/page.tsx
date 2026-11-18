"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  Ticket, 
  Tag, 
  AlertCircle,
  CheckCircle2, 
  Clock, 
  Check, 
  ChevronDown,
  Plus,
  MessageCircle,
  ShoppingBag,
  Loader2,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { SupportTicket, TicketStatus, TicketPriority } from "@/lib/types";

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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTicket, setNewTicket] = useState({
    customer_email: "",
    subject: "",
    type: "order",
    priority: "medium" as TicketPriority,
    order_id: "",
    message: "",
  });

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/support/tickets?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.tickets) {
        setTickets(data.tickets);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("support-tickets-list-realtime")
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.customer_email.trim() || !newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error("Please fill in email, subject, and initial message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email: newTicket.customer_email.trim(),
          subject: newTicket.subject.trim(),
          type: newTicket.type,
          priority: newTicket.priority,
          order_id: newTicket.order_id.trim() || null,
          message: newTicket.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      toast.success(`Ticket ${data.ticket?.ticket_number || ""} created successfully`);
      setIsModalOpen(false);
      setNewTicket({
        customer_email: "",
        subject: "",
        type: "order",
        priority: "medium",
        order_id: "",
        message: "",
      });
      fetchTickets();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create ticket";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resolveTicket = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvingId(id);
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve ticket");
      }
      toast.success("Ticket marked as resolved");
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "resolved" as TicketStatus } : t))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating ticket";
      toast.error(message);
    } finally {
      setResolvingId(null);
    }
  };

  const filterTabs = [
    { label: "All Tickets", value: "all" },
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display uppercase tracking-tight">Support Tickets</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and resolve customer complaints, orders, and inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTickets()}
            className="p-3 bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh tickets"
          >
            <RefreshCw className={cn("w-5 h-5 text-gray-600", loading && "animate-spin")} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden !p-0">
        <div className="px-6 py-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                  statusFilter === tab.value ? "bg-white text-gray-900 shadow-sm font-black" : "text-gray-500 hover:text-gray-700 font-bold"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-gray-50 border border-border rounded-xl py-2 px-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-50 border border-border rounded-xl py-2 px-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Types</option>
              <option value="order">Order</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="delivery">Delivery</option>
              <option value="quality">Quality</option>
              <option value="general">General</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 text-sm font-medium">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search ticket # or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-border rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="py-4 px-6">Ticket Details</th>
                <th className="py-4 px-2">Linked Order</th>
                <th className="py-4 px-2">Type</th>
                <th className="py-4 px-2">Priority</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading support tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400 font-medium">
                    No support tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {tickets.map((t) => {
                    const customerName = t.profiles?.full_name || t.profiles?.email || "Customer";
                    const isResolving = resolvingId === t.id;

                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={t.id} 
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="py-5 px-6">
                          <Link href={`/support/chat?ticketId=${t.id}`} className="block">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0 text-primary group-hover:scale-105 transition-transform">
                                <Ticket className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-gray-900 text-sm tracking-tight group-hover:text-primary transition-colors">
                                    {t.ticket_number}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                                    {formatRelativeTime(t.last_message_at || t.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-gray-700 mt-1">{customerName}</p>
                                <p className="text-xs text-gray-500 mt-0.5 max-w-[320px] truncate font-medium">{t.subject}</p>
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Linked Order */}
                        <td className="py-5 px-2">
                          {t.orders ? (
                            <Link 
                              href={`/orders/${t.orders.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{t.orders.order_number}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">—</span>
                          )}
                        </td>

                        <td className="py-5 px-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded-md w-fit uppercase tracking-widest">
                            <Tag className="w-3 h-3" />
                            {t.type}
                          </div>
                        </td>

                        <td className="py-5 px-2">
                          <span className={cn(
                            "text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter border",
                            t.priority === "high" ? "text-red-600 bg-red-50 border-red-100" : 
                            t.priority === "medium" ? "text-orange-600 bg-orange-50 border-orange-100" : "text-blue-600 bg-blue-50 border-blue-100"
                          )}>
                            {t.priority}
                          </span>
                        </td>

                        <td className="py-5 px-2">
                          <span className={cn(
                            "flex items-center gap-2 w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase border tracking-widest transition-all",
                            t.status === "open" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            t.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" :
                            t.status === "resolved" ? "bg-green-50 text-green-700 border-green-200" :
                            "bg-gray-100 text-gray-600 border-gray-200"
                          )}>
                            {t.status === "open" ? <AlertCircle className="w-3 h-3" /> :
                             t.status === "in_progress" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {t.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/support/chat?ticketId=${t.id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </Link>
                            {t.status !== "resolved" && t.status !== "closed" && (
                              <button 
                                onClick={(e) => resolveTicket(t.id, e)}
                                disabled={isResolving}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-black hover:bg-green-600 hover:text-white transition-all uppercase tracking-tighter disabled:opacity-50"
                              >
                                {isResolving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>Resolve</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Create Support Ticket</h2>
                  <p className="text-xs text-gray-500 font-medium font-sans">Open a new inquiry or customer issue.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                  <ChevronDown className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Email</label>
                    <input 
                      type="email"
                      required
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      placeholder="e.g. customer@example.com"
                      value={newTicket.customer_email}
                      onChange={(e) => setNewTicket({...newTicket, customer_email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                    <input 
                      required
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      placeholder="e.g. Inquiry regarding order delivery delay"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Type</label>
                      <select 
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                        value={newTicket.type}
                        onChange={(e) => setNewTicket({...newTicket, type: e.target.value})}
                      >
                        <option value="order">Order Issue</option>
                        <option value="payment">Payment Issue</option>
                        <option value="refund">Refund Request</option>
                        <option value="delivery">Delivery Inquiry</option>
                        <option value="quality">Food Quality</option>
                        <option value="general">General Support</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                      <select 
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-red-600"
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as TicketPriority})}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Linked Order ID (Optional)
                    </label>
                    <input 
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      placeholder="e.g. UUID of linked order (if applicable)"
                      value={newTicket.order_id}
                      onChange={(e) => setNewTicket({...newTicket, order_id: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Initial Message</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm resize-none"
                      placeholder="Describe the customer problem or conversation opening..."
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? "Creating..." : "Create Ticket"}</span>
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
