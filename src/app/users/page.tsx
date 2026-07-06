"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  UserX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initialCustomers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+234 812 345 6789", joined: "Jan 12, 2026", orders: 24, status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+234 803 111 2222", joined: "Feb 05, 2026", orders: 12, status: "Active" },
  { id: 3, name: "Robert Brown", email: "robert@example.com", phone: "+234 701 999 0000", joined: "Mar 10, 2026", orders: 5, status: "Inactive" },
  { id: 4, name: "Alice Green", email: "alice@example.com", phone: "+234 818 555 4444", joined: "Dec 20, 2025", orders: 48, status: "Active" },
  { id: 5, name: "Samuel Ade", email: "sam@example.com", phone: "+234 902 333 4444", joined: "Mar 15, 2026", orders: 2, status: "Active" },
];

export default function UsersPage() {
  const [data, setData] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = data.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: number) => {
    setData(data.map(u => {
      if (u.id === id) {
        const newStatus = u.status === "Active" ? "Inactive" : "Active";
        toast.info(`${u.name} is now ${newStatus}`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your customer database and view their order history.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-primary/5 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/10">
                Total: {data.length} Customers
            </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="dashboard-card overflow-hidden !p-0 border-none shadow-premium">
        <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-white hover:text-gray-900 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-border">
                <th className="py-4 px-8">Customer</th>
                <th className="py-4 px-2">Contact Info</th>
                <th className="py-4 px-2 tracking-tighter">Joined Date</th>
                <th className="py-4 px-2">Orders</th>
                <th className="py-4 px-2 text-center">Status</th>
                <th className="py-4 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={user.id} 
                  className="hover:bg-primary/[0.02] transition-colors group"
                >
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-base border border-border/50 shadow-inner group-hover:scale-110 transition-transform">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-black text-gray-900 tracking-tight text-base">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-6 px-2">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-700 font-bold">
                        <Mail className="w-3.5 h-3.5 text-primary/40" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                        <Phone className="w-3.5 h-3.5 text-primary/40" /> {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-2 text-[11px] text-gray-500 font-black uppercase tracking-tighter">{user.joined}</td>
                  <td className="py-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="text-base font-black text-gray-900 tracking-tight">{user.orders}</span>
                    </div>
                  </td>
                  <td className="py-6 px-2 text-center">
                    <span className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                      user.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-3 bg-white border border-border rounded-xl text-gray-400 hover:text-primary hover:shadow-sm transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleStatus(user.id)}
                        className={cn(
                            "p-3 rounded-xl border transition-all",
                            user.status === "Active" ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white" : "bg-green-50 text-green-500 border-green-100 hover:bg-green-500 hover:text-white"
                        )}
                        title={user.status === "Active" ? "Deactivate" : "Activate"}
                      >
                         {user.status === "Active" ? <UserX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
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
    </div>
  );
}
