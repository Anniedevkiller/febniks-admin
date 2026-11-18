"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Send, 
  MessageCircle, 
  Ticket, 
  ShoppingBag, 
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { SupportTicket, SupportMessage, TicketStatus, TicketPriority } from "@/lib/types";

function formatMessageTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTicketId = searchParams.get("ticketId");

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTicketId);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);

  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch ticket list
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support/tickets");
      const data = await res.json();
      if (res.ok && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Fetch single ticket details
  const fetchTicketDetails = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`);
      const data = await res.json();
      if (res.ok && data.ticket) {
        setSelectedTicket(data.ticket);
      }
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
    }
  }, []);

  // Fetch messages for active ticket
  const fetchMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}/messages`);
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 50);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Sync ticketId from URL or auto-select first ticket
  useEffect(() => {
    if (initialTicketId) {
      setSelectedTicketId(initialTicketId);
    } else if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [initialTicketId, tickets, selectedTicketId]);

  // When active ticket ID changes, load details & messages
  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetails(selectedTicketId);
      fetchMessages(selectedTicketId);
    } else {
      setSelectedTicket(null);
      setMessages([]);
    }
  }, [selectedTicketId, fetchTicketDetails, fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime subscription for tickets and active messages
  useEffect(() => {
    const supabase = createClient();

    const ticketsChannel = supabase
      .channel("support-tickets-chat-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => {
          fetchTickets();
          if (selectedTicketId) {
            fetchTicketDetails(selectedTicketId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, [fetchTickets, fetchTicketDetails, selectedTicketId]);

  useEffect(() => {
    if (!selectedTicketId) return;

    const supabase = createClient();
    const messagesChannel = supabase
      .channel(`support-messages-${selectedTicketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${selectedTicketId}`,
        },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedTicketId]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicketId(ticket.id);
    setSelectedTicket(ticket);
    router.replace(`/support/chat?ticketId=${ticket.id}`);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedTicketId || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error sending message";
      toast.error(msg);
      setInputText(textToSend); // restore on error
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!selectedTicketId) return;
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(`Ticket status updated to ${newStatus}`);
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicketId ? { ...t, status: newStatus } : t))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      toast.error(msg);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!selectedTicketId) return;
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update priority");

      toast.success(`Ticket priority updated to ${newPriority}`);
      setSelectedTicket((prev) => (prev ? { ...prev, priority: newPriority } : prev));
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicketId ? { ...t, priority: newPriority } : t))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating priority";
      toast.error(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const num = (t.ticket_number || "").toLowerCase();
    const sub = (t.subject || "").toLowerCase();
    const cust = (t.profiles?.full_name || t.profiles?.email || "").toLowerCase();
    return num.includes(q) || sub.includes(q) || cust.includes(q);
  });

  return (
    <div className="h-[calc(100vh-140px)] -mt-2 flex overflow-hidden dashboard-card !p-0 border-none bg-transparent">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-border bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span>Support Chats</span>
            </h2>
            <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {tickets.length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-border rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-primary/10 transition-all outline-none font-bold"
            />
          </div>
        </div>

        {/* Scrollable ticket list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {loadingTickets ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
              <p className="text-xs font-bold text-gray-500">Loading chats...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-bold text-gray-600">No active chats</p>
              <p className="text-xs text-gray-400 mt-1">
                There are no support tickets matching this query.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              const customerName = ticket.profiles?.full_name || ticket.profiles?.email || "Customer";

              return (
                <button
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={cn(
                    "w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-gray-50",
                    isSelected && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 font-bold text-xs uppercase">
                    {customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-gray-900 text-xs truncate">
                        {customerName}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                        {formatRelativeTime(ticket.last_message_at || ticket.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-tight">
                        {ticket.ticket_number}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.2 rounded uppercase",
                        ticket.priority === "high" ? "bg-red-50 text-red-600" :
                        ticket.priority === "medium" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate font-medium">
                      {ticket.subject}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {!selectedTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Conversation Selected</h3>
            <p className="text-xs text-gray-500 max-w-xs mt-1">
              Select a support ticket from the sidebar to inspect messages and reply as admin.
            </p>
          </div>
        ) : (
          <>
            {/* Active Ticket Header */}
            <div className="px-6 py-4 bg-white border-b border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-gray-900">
                      {selectedTicket.ticket_number}
                    </h3>
                    <span className="text-xs text-gray-500 font-bold">
                      • {selectedTicket.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {selectedTicket.profiles?.full_name || selectedTicket.profiles?.email || "Customer"}
                    </span>
                    {selectedTicket.profiles?.email && (
                      <span className="text-gray-400">({selectedTicket.profiles.email})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action controls & linked order */}
              <div className="flex items-center gap-3">
                {selectedTicket.orders && (
                  <Link
                    href={`/orders/${selectedTicket.orders.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order {selectedTicket.orders.order_number}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </Link>
                )}

                {/* Priority Selector */}
                <div className="relative">
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="bg-gray-100 border border-border rounded-xl py-1.5 px-3 text-xs font-black uppercase tracking-wider outline-none text-gray-700 cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {/* Status Selector */}
                <div className="relative">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className={cn(
                      "rounded-xl py-1.5 px-3 text-xs font-black uppercase tracking-wider outline-none cursor-pointer border",
                      selectedTicket.status === "open" ? "bg-amber-50 text-amber-800 border-amber-300" :
                      selectedTicket.status === "in_progress" ? "bg-blue-50 text-blue-800 border-blue-300" :
                      selectedTicket.status === "resolved" ? "bg-green-50 text-green-800 border-green-300" :
                      "bg-gray-100 text-gray-700 border-gray-300"
                    )}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                  <span className="text-xs font-bold">Loading conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No messages in this ticket yet. Send the first response below.
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_role === "admin";
                  const senderName = isAdmin 
                    ? "Support Admin" 
                    : (msg.profiles?.full_name || selectedTicket.profiles?.full_name || "Customer");

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-lg",
                        isAdmin ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {senderName}
                        </span>
                        <span className="text-[10px] text-gray-300">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm font-medium",
                          isAdmin
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white text-gray-800 border border-border rounded-tl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">
                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    placeholder={`Reply to ${selectedTicket.profiles?.full_name || "customer"}... (Press Enter to send, Shift+Enter for newline)`}
                    className="w-full bg-gray-50 border border-border rounded-2xl py-3 px-4 text-sm outline-none resize-none max-h-32 min-h-[48px] focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-3.5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-primary/20"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-140px)] flex items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
