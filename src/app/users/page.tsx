"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Mail, 
  Phone, 
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface UserWithOrders extends Profile {
  order_count: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithOrders[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load users");
        setUsers(json.users || []);
      } catch (err: any) {
        toast.error(err.message || "Error loading users");
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1 font-medium">View registered customer profiles and their order counts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary/5 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/10">
            Total: {users.length} Profiles
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
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-border">
                <th className="py-4 px-8">User</th>
                <th className="py-4 px-2">Contact Info</th>
                <th className="py-4 px-2">Orders</th>
                <th className="py-4 px-2 text-center">Role</th>
                <th className="py-4 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    Loading profiles...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    No profiles found.
                  </td>
                </tr>
              ) : (
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
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-base border border-border/50 shadow-inner">
                            {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-black text-gray-900 tracking-tight text-base">
                            {user.full_name || "Unnamed User"}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-2">
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-700 font-bold">
                            <Mail className="w-3.5 h-3.5 text-primary/40" /> {user.email || "—"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                            <Phone className="w-3.5 h-3.5 text-primary/40" /> {user.phone || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <span className="text-base font-black text-gray-900 tracking-tight">
                            {user.order_count}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-2 text-center">
                        <span className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                          user.role === "admin"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-green-50 text-green-700 border-green-200"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <Link
                          href={`/orders?q=${encodeURIComponent(user.email || user.full_name || "")}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-border rounded-xl text-xs font-bold text-gray-600 hover:text-primary hover:shadow-sm transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Orders</span>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
