"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Ticket, 
  User, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Reply,
  Check,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const initialTickets = [
  { id: "#TKT-101", customer: "John Doe", type: "Payment", issue: "Payment failed but debited", status: "Open", priority: "High", time: "2 mins ago" },
  { id: "#TKT-102", customer: "Jane Smith", type: "Order Delay", issue: "Order #ORD-7722 still not here", status: "In Progress", priority: "Medium", time: "15 mins ago" },
  { id: "#TKT-103", customer: "Robert Brown", type: "Refund", issue: "Charged twice for same order", status: "Resolved", priority: "High", time: "1 hour ago" },
  { id: "#TKT-104", customer: "Alice Green", type: "App Bug", issue: "Menu not showing correctly", status: "Open", priority: "Low", time: "2 hours ago" },
  { id: "#TKT-105", customer: "Samuel Ade", type: "Order Delay", issue: "Missing items in delivery", status: "Open", priority: "Medium", time: "3 hours ago" },
];

export default function TicketsPage() {
  const [data, setData] = useState(initialTickets);
  const [filter, setFilter] = useState("All Tickets");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [newTicket, setNewTicket] = useState({
    customer: "",
    type: "Order Delay",
    priority: "Medium",
    issue: ""
  });

  const filteredTickets = data.filter(t => {
    const matchesFilter = filter === "All Tickets" || t.status === filter;
    const matchesSearch = t.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `#TKT-${100 + data.length + 1}`;
    const ticketToAdd = { ...newTicket, id, status: "Open", time: "Just now" };
    setData([ticketToAdd, ...data]);
    setIsModalOpen(false);
    setNewTicket({ customer: "", type: "Order Delay", priority: "Medium", issue: "" });
    toast.success(`Ticket ${id} created for ${newTicket.customer}`);
  };

  const resolveTicket = (id: string) => {
    setData(data.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
    toast.success(`Ticket ${id} marked as Resolved`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display uppercase tracking-tight">Support Tickets</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and resolve customer complaints and queries.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="dashboard-card overflow-hidden !p-0">
        <div className="px-6 py-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
            {["All Tickets", "Open", "In Progress", "Resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                  filter === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 font-bold"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <div className="relative w-full lg:w-64 text-sm font-medium">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search tickets..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-gray-50 border border-border rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
               />
             </div>
             <button className="p-2.5 border border-border rounded-xl hover:bg-gray-50 transition-colors text-gray-400">
               <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-4 px-6">Ticket Details</th>
                  <th className="py-4 px-2">Type</th>
                  <th className="py-4 px-2">Priority</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                {filteredTickets.map((t) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={t.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0 text-primary">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                             <span className="font-bold text-gray-900 text-sm tracking-tight">{t.id}</span>
                             <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{t.time}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-700 mt-1">{t.customer}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[300px] truncate font-medium">{t.issue}</p>
                        </div>
                      </div>
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
                        t.priority === "High" ? "text-red-600 bg-red-50 border-red-100" : 
                        t.priority === "Medium" ? "text-orange-600 bg-orange-50 border-orange-100" : "text-blue-600 bg-blue-50 border-blue-100"
                      )}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-5 px-2">
                       <span className={cn(
                          "flex items-center gap-2 w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase border tracking-widest transition-all",
                          t.status === "Open" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          t.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" :
                          "bg-green-50 text-green-700 border-green-200"
                       )}>
                         {t.status === "Open" ? <AlertCircle className="w-3 h-3" /> :
                          t.status === "In Progress" ? <Clock className="w-3 h-3 animate-spin duration-[3000ms]" /> : <CheckCircle2 className="w-3 h-3" />}
                         {t.status}
                       </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                         <button className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-xs font-black text-gray-600 hover:bg-white hover:shadow-sm transition-all uppercase tracking-tighter">
                            <Reply className="w-3.5 h-3.5" />
                            Reply
                         </button>
                         {t.status !== "Resolved" && (
                            <button 
                                onClick={() => resolveTicket(t.id)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-black hover:bg-green-600 hover:text-white transition-all uppercase tracking-tighter"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Resolve
                            </button>
                         )}
                         <button className="p-2 text-gray-400 hover:text-gray-900 transition-all">
                            <MoreVertical className="w-5 h-5" />
                         </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
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
                   <p className="text-xs text-gray-500 font-medium font-sans">Open a new inquiry for a customer complaint.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                   <ChevronDown className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Name</label>
                      <input 
                        required
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        placeholder="e.g. Samuel Ade"
                        value={newTicket.customer}
                        onChange={(e) => setNewTicket({...newTicket, customer: e.target.value})}
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Type</label>
                        <select 
                            className="w-full bg-gray-100/50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                            value={newTicket.type}
                            onChange={(e) => setNewTicket({...newTicket, type: e.target.value})}
                        >
                            <option>Payment</option>
                            <option>Order Delay</option>
                            <option>Refund</option>
                            <option>App Bug</option>
                            <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                        <select 
                            className="w-full bg-gray-100/50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-red-600"
                            value={newTicket.priority}
                            onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                        >
                            <option value="High">🔴 High</option>
                            <option value="Medium">🟠 Medium</option>
                            <option value="Low">🔵 Low</option>
                        </select>
                      </div>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Description</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none"
                        placeholder="Describe the customer problem..."
                        value={newTicket.issue}
                        onChange={(e) => setNewTicket({...newTicket, issue: e.target.value})}
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
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest"
                    >
                      Create Ticket
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
