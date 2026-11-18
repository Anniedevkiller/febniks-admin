"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Fish, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Search, 
  History,
  Trash2,
  RefreshCcw,
  X,
  Edit2,
  Sliders,
  Loader2,
  PackageCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { InventoryItem } from "@/lib/types";

interface InventoryLogItem {
  id: string;
  item_id: string;
  change: number;
  quantity_after: number;
  reason: string;
  note: string | null;
  created_at: string;
  item?: {
    name: string;
    unit: string;
    category?: string;
  };
  creator?: {
    full_name: string;
    email: string;
  };
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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Add Item form state
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Fresh Fish",
    unit: "kg",
    quantity: "0",
    low_level: "15",
    critical_level: "5",
  });

  // Adjust stock form state
  const [adjustment, setAdjustment] = useState({
    direction: "add" as "add" | "deduct",
    amount: "",
    reason: "Restock",
    note: "",
  });

  // Edit item form state
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    unit: "kg",
    low_level: "15",
    critical_level: "5",
    is_active: true,
  });

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory/items");
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to load inventory items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory/logs?limit=30");
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load inventory logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchLogs();
  }, [fetchItems, fetchLogs]);

  // Realtime Subscriptions
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("inventory-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_items" },
        () => {
          fetchItems();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "inventory_logs" },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems, fetchLogs]);

  const getItemStatus = (item: InventoryItem) => {
    if (item.quantity <= Number(item.critical_level)) return "Critical";
    if (item.quantity <= Number(item.low_level)) return "Low Stock";
    return "In Stock";
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(q);
    const catMatch = (item.category || "").toLowerCase().includes(q);
    return nameMatch || catMatch;
  });

  // Count items needing attention
  const lowStockCount = items.filter(
    (i) => i.quantity <= Number(i.low_level) && i.quantity > Number(i.critical_level)
  ).length;
  const criticalCount = items.filter(
    (i) => i.quantity <= Number(i.critical_level)
  ).length;

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name.trim(),
          category: newItem.category.trim() || null,
          unit: newItem.unit.trim() || "kg",
          quantity: Number(newItem.quantity) || 0,
          low_level: Number(newItem.low_level) || 15,
          critical_level: Number(newItem.critical_level) || 5,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create item");
      }

      toast.success(`${newItem.name} added to inventory`);
      setIsAddModalOpen(false);
      setNewItem({
        name: "",
        category: "Fresh Fish",
        unit: "kg",
        quantity: "0",
        low_level: "15",
        critical_level: "5",
      });
      fetchItems();
      fetchLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating item";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open adjust modal for specific item
  const openAdjustModal = (item: InventoryItem) => {
    setActiveItem(item);
    setAdjustment({
      direction: "add",
      amount: "",
      reason: "Restock",
      note: "",
    });
    setIsAdjustModalOpen(true);
  };

  // Handle Adjust Stock (calls RPC adjust_inventory)
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const amt = parseFloat(adjustment.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid positive number for adjustment amount");
      return;
    }

    const change = adjustment.direction === "add" ? amt : -amt;

    // Check if deduction exceeds current quantity
    if (change < 0 && activeItem.quantity + change < 0) {
      toast.error(`Cannot deduct ${amt} ${activeItem.unit}. Only ${activeItem.quantity} ${activeItem.unit} in stock.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          p_item_id: activeItem.id,
          p_change: change,
          p_reason: adjustment.reason.trim() || "Manual adjustment",
          p_note: adjustment.note.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to adjust inventory");
      }

      toast.success(
        `Successfully ${adjustment.direction === "add" ? "added" : "deducted"} ${amt} ${activeItem.unit} for ${activeItem.name}`
      );
      setIsAdjustModalOpen(false);
      fetchItems();
      fetchLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adjusting inventory";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (item: InventoryItem) => {
    setActiveItem(item);
    setEditForm({
      name: item.name,
      category: item.category || "",
      unit: item.unit,
      low_level: String(item.low_level),
      critical_level: String(item.critical_level),
      is_active: item.is_active,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Item
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inventory/items/${activeItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          category: editForm.category.trim() || null,
          unit: editForm.unit.trim(),
          low_level: Number(editForm.low_level),
          critical_level: Number(editForm.critical_level),
          is_active: editForm.is_active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update item");
      }

      toast.success(`${editForm.name} updated successfully`);
      setIsEditModalOpen(false);
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating item";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/inventory/items/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete item");
      }

      toast.success(`${name} removed from inventory`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      fetchLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting item";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display uppercase tracking-tight">Stock Inventory</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitor real-time supplies, thresholds, and adjust inventory ledger.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchItems();
              fetchLogs();
            }}
            className="p-3 bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh inventory"
          >
            <RefreshCcw className={cn("w-5 h-5 text-gray-600", loading && "animate-spin")} />
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {(criticalCount > 0 || lowStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Stock Attention Required
              </p>
              <p className="text-xs text-amber-700">
                {criticalCount > 0 && <span className="font-bold text-red-600">{criticalCount} critical items. </span>}
                {lowStockCount > 0 && <span>{lowStockCount} items below safe stock threshold.</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Stock Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="dashboard-card !p-0 overflow-hidden border-2 border-transparent hover:border-primary/5 transition-all">
            <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg">Inventory Overview</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded-full">
                  {items.length} items
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item or category..."
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
                    <th className="py-4 px-6">Item / Name</th>
                    <th className="py-4 px-2">Quantity</th>
                    <th className="py-4 px-2">Stock Status</th>
                    <th className="py-4 px-2">Category</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Loading inventory records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                        No inventory items recorded yet. Click &quot;Add Item&quot; to begin.
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {filteredItems.map((item) => {
                        const status = getItemStatus(item);

                        return (
                          <motion.tr 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={item.id} 
                            className="hover:bg-primary/[0.02] transition-colors group"
                          >
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 shadow-sm",
                                  status === "Critical" ? "bg-red-50 text-red-600 border-red-100" : 
                                  status === "Low Stock" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                )}>
                                  <Fish className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-gray-900 tracking-tight text-base">{item.name}</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                    Safe: &gt;{item.low_level} {item.unit} • Crit: &le;{item.critical_level} {item.unit}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-2">
                              <div className="flex flex-col">
                                <span className="font-black text-gray-900 text-lg">
                                  {item.quantity}{" "}
                                  <span className="text-[10px] text-gray-400 uppercase">{item.unit}</span>
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-2">
                              <span className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-1",
                                status === "Critical" ? "bg-red-50 text-red-700 border-red-200" : 
                                status === "Low Stock" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                "bg-green-50 text-green-700 border-green-200"
                              )}>
                                {status === "Critical" && <AlertCircle className="w-2.5 h-2.5" />}
                                {status}
                              </span>
                            </td>
                            <td className="py-5 px-2">
                              <span className="text-xs font-bold px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                                {item.category || "General"}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openAdjustModal(item)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                  title="Adjust Stock (+ / -)"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                  <span>Adjust</span>
                                </button>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-2 bg-white border border-border rounded-xl text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all"
                                  title="Edit Item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="p-2 bg-white border border-border rounded-xl text-gray-400 hover:text-red-500 hover:shadow-sm transition-all"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
        </div>

        {/* Sidebar Alerts & Logs */}
        <div className="space-y-8">
          <div className="dashboard-card border-none bg-white shadow-premium">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-3">
                <History className="w-4 h-4 text-primary" />
                Ledger Activity
              </h3>
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                {logs.length} events
              </span>
            </div>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <span className="text-xs">Loading ledger...</span>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium py-6 text-center">
                No stock activity logs yet.
              </p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {logs.map((log) => {
                  const isPositive = Number(log.change) > 0;
                  const itemName = log.item?.name || "Inventory Item";
                  const unit = log.item?.unit || "kg";

                  return (
                    <div key={log.id} className="flex gap-3 items-start p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 text-xs font-bold text-gray-900">
                          <span className="truncate">{itemName}</span>
                          <span className={cn(
                            "font-black shrink-0",
                            isPositive ? "text-green-600" : "text-red-600"
                          )}>
                            {isPositive ? `+${log.change}` : log.change} {unit}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {log.reason}
                          {log.note && <span className="text-gray-400"> — {log.note}</span>}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                          <span>Balance: {log.quantity_after} {unit}</span>
                          <span>{formatRelativeTime(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-border"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">New Stock Item</h2>
                  <p className="text-xs text-gray-500 font-medium">Add a species, product, or raw supply to track.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Item Name</label>
                  <input 
                    required
                    className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    placeholder="e.g. Tilapia (Fresh)"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                    <input 
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      placeholder="e.g. Fresh Fish"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Unit</label>
                    <input 
                      required
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      placeholder="kg, pcs, packs"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Initial Quantity</label>
                  <input 
                    type="number"
                    min="0"
                    step="any"
                    required
                    className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-base"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Low Threshold</label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-2.5 px-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      value={newItem.low_level}
                      onChange={(e) => setNewItem({ ...newItem, low_level: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Critical Threshold</label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-2.5 px-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      value={newItem.critical_level}
                      onChange={(e) => setNewItem({ ...newItem, critical_level: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? "Saving..." : "Create Item"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Stock Modal (calls RPC adjust_inventory) */}
      <AnimatePresence>
        {isAdjustModalOpen && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-border"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Adjust Stock</h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {activeItem.name} (Current: {activeItem.quantity} {activeItem.unit})
                  </p>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Action Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAdjustment({ ...adjustment, direction: "add" })}
                      className={cn(
                        "py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all",
                        adjustment.direction === "add"
                          ? "bg-green-500 text-white border-green-600 shadow-md"
                          : "bg-gray-100 text-gray-600 border-border"
                      )}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Add / Restock</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustment({ ...adjustment, direction: "deduct" })}
                      className={cn(
                        "py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all",
                        adjustment.direction === "deduct"
                          ? "bg-red-500 text-white border-red-600 shadow-md"
                          : "bg-gray-100 text-gray-600 border-border"
                      )}
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Deduct / Waste</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Quantity ({activeItem.unit})
                  </label>
                  <input 
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-xl"
                    placeholder="e.g. 25"
                    value={adjustment.amount}
                    onChange={(e) => setAdjustment({ ...adjustment, amount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Reason</label>
                  <select 
                    className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  >
                    <option value="Restock">Restock / Shipment</option>
                    <option value="Customer Order">Fulfilled Order</option>
                    <option value="Audit Adjustment">Audit Adjustment</option>
                    <option value="Spoilage / Waste">Spoilage / Dead Fish</option>
                    <option value="Kitchen Usage">Kitchen Usage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Note (Optional)</label>
                  <input 
                    className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    placeholder="e.g. Supplier batch #9102"
                    value={adjustment.note}
                    onChange={(e) => setAdjustment({ ...adjustment, note: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? "Updating..." : "Confirm Adjustment"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {isEditModalOpen && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-border"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Edit Item</h2>
                  <p className="text-xs text-gray-500 font-medium">Update item parameters and thresholds.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditItem} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Item Name</label>
                  <input 
                    required
                    className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                    <input 
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Unit</label>
                    <input 
                      required
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Low Level</label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-2.5 px-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      value={editForm.low_level}
                      onChange={(e) => setEditForm({ ...editForm, low_level: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Critical Level</label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-2.5 px-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      value={editForm.critical_level}
                      onChange={(e) => setEditForm({ ...editForm, critical_level: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? "Saving..." : "Save Changes"}</span>
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
