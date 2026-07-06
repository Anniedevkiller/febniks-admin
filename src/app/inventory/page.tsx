"use client";

import React, { useState } from "react";
import { 
  Fish, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Search, 
  Settings,
  ArrowRight,
  History,
  Trash2,
  RefreshCcw,
  ChevronDown,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const initialFishStock = [
  { id: 1, type: "Tilapia", quantity: 45, unit: "kg", status: "In Stock", trend: "+5%", lastUpdated: "Today, 10:00 AM" },
  { id: 2, type: "Catfish", quantity: 12, unit: "kg", status: "Low Stock", trend: "-12%", lastUpdated: "Today, 09:30 AM" },
  { id: 3, type: "Croaker", quantity: 28, unit: "kg", status: "In Stock", trend: "+8%", lastUpdated: "Yesterday, 04:00 PM" },
  { id: 4, type: "Red Snapper", quantity: 5, unit: "kg", status: "Critical", trend: "-20%", lastUpdated: "Today, 11:20 AM" },
  { id: 5, type: "Mackerel", quantity: 60, unit: "kg", status: "In Stock", trend: "+2%", lastUpdated: "Yesterday, 02:00 PM" },
];

const initialStockLogs = [
  { id: 1, action: "Deduction", item: "Catfish", amount: "-3kg", reason: "Order #ORD-7722", time: "10 mins ago" },
  { id: 2, action: "Addition", item: "Tilapia", amount: "+20kg", reason: "New Supply", time: "2 hours ago" },
  { id: 3, action: "Deduction", item: "Red Snapper", amount: "-2kg", reason: "Order #ORD-7724", time: "4 hours ago" },
];

export default function InventoryPage() {
  const [stock, setStock] = useState(initialFishStock);
  const [logs, setLogs] = useState(initialStockLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [newItem, setNewItem] = useState({
    type: "Tilapia",
    quantity: "",
    reason: "Restock"
  });

  const filteredStock = stock.filter(item => 
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatus = (qty: number) => {
    if (qty <= 5) return "Critical";
    if (qty <= 15) return "Low Stock";
    return "In Stock";
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(newItem.quantity);
    if (isNaN(qty)) return;

    // Update or Add Stock
    const existingIndex = stock.findIndex(s => s.type === newItem.type);
    let newStockList = [...stock];
    
    if (existingIndex > -1) {
       const updatedQty = stock[existingIndex].quantity + qty;
       newStockList[existingIndex] = {
         ...stock[existingIndex],
         quantity: updatedQty,
         status: getStatus(updatedQty),
         lastUpdated: "Just now"
       };
    } else {
       newStockList.push({
         id: stock.length + 1,
         type: newItem.type,
         quantity: qty,
         unit: "kg",
         status: getStatus(qty),
         trend: "New",
         lastUpdated: "Just now"
       });
    }

    setStock(newStockList);

    // Add Log
    const newLog = {
      id: logs.length + 1,
      action: "Addition" as const,
      item: newItem.type,
      amount: `+${qty}kg`,
      reason: newItem.reason,
      time: "Just now"
    };
    setLogs([newLog, ...logs]);

    setIsModalOpen(false);
    setNewItem({ type: "Tilapia", quantity: "", reason: "Restock" });
    toast.success(`Successfully added ${qty}kg to ${newItem.type}`);
  };

  const deleteFish = (id: number) => {
      setStock(stock.filter(s => s.id !== id));
      toast.error("Fish category removed from inventory");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display uppercase tracking-tight">Fish Stock Inventory</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitor and manage your fish farm supplies in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors uppercase tracking-widest text-gray-400">
            <History className="w-4 h-4" />
            <span>Logs</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Stock Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="dashboard-card !p-0 overflow-hidden border-2 border-transparent hover:border-primary/5 transition-all">
            <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
              <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg">Inventory Overview</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search species..."
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
                    <th className="py-4 px-6">Species</th>
                    <th className="py-4 px-2">Quantity</th>
                    <th className="py-4 px-2">Threshold</th>
                    <th className="py-4 px-2">Market Trend</th>
                    <th className="py-4 px-6 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <AnimatePresence>
                  {filteredStock.map((fish) => (
                    <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={fish.id} 
                        className="hover:bg-primary/[0.02] transition-colors group"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 shadow-sm",
                            fish.status === "Critical" ? "bg-red-50 text-red-600 border-red-100" : 
                            fish.status === "Low Stock" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            <Fish className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 tracking-tight text-base">{fish.type}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{fish.lastUpdated}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-2">
                         <div className="flex flex-col">
                            <span className="font-black text-gray-900 text-lg">{fish.quantity} <span className="text-[10px] text-gray-400 uppercase">{fish.unit}</span></span>
                            <div className="w-20 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                               <div 
                                 className={cn(
                                    "h-full transition-all duration-1000",
                                    fish.status === "Critical" ? "bg-red-500 w-[15%]" : 
                                    fish.status === "Low Stock" ? "bg-orange-500 w-[40%]" : "bg-green-500 w-[85%]"
                                 )} 
                               />
                            </div>
                         </div>
                      </td>
                      <td className="py-5 px-2">
                        <span className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          fish.status === "Critical" ? "bg-red-50 text-red-700 border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : 
                          fish.status === "Low Stock" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          "bg-green-50 text-green-700 border-green-200"
                        )}>
                          {fish.status}
                        </span>
                      </td>
                      <td className="py-5 px-2">
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-md bg-gray-50 w-fit",
                          fish.trend.startsWith("-") ? "text-red-500" : 
                          fish.trend === "New" ? "text-blue-500" : "text-green-500"
                        )}>
                          {fish.trend.startsWith("-") ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          {fish.trend}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2.5 bg-white border border-border rounded-xl text-gray-400 hover:text-primary hover:shadow-sm transition-all">
                            <RefreshCcw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteFish(fish.id)}
                            className="p-2.5 bg-white border border-border rounded-xl text-gray-400 hover:text-red-500 hover:shadow-sm transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Sidebar Alerts & Logs */}
        <div className="space-y-8">
          {/* Alarms Card */}
          <div className="dashboard-card bg-[#9B2226] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <AlertTriangle className="w-7 h-7 text-accent" />
                </div>
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </button>
                </div>
                <h3 className="text-2xl font-black font-display mb-2 uppercase tracking-tight">Restock Alert!</h3>
                <p className="text-white/70 text-sm mb-8 leading-relaxed font-medium">
                Several items are approaching critical thresholds. Replenish <span className="text-accent font-black">Fish Species</span> soon.
                </p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 bg-accent text-sidebar rounded-2xl font-black text-sm hover:scale-[1.02] transform transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                >
                Order Replenishment
                </button>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="dashboard-card border-none bg-white shadow-premium">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    Ledger Activity
                </h3>
                <div className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded-md">LIVE</div>
            </div>
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
              <AnimatePresence>
              {logs.map((log) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log.id} 
                    className="flex gap-5 group relative"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 border-2 border-white shadow-sm",
                    log.action === "Deduction" ? "bg-orange-500 text-white" : "bg-green-500 text-white"
                  )}>
                    {log.action === "Deduction" ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-gray-900 text-sm tracking-tight">{log.item}</span>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                        log.action === "Deduction" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                      )}>
                        {log.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      <span>{log.reason}</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-border"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Replenish Stock</h2>
                   <p className="text-xs text-gray-500 font-medium">Update current fish quantities manually.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                   <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddStock} className="p-8 space-y-6">
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fish Species</label>
                      <select 
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        value={newItem.type}
                        onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                      >
                         <option>Tilapia</option>
                         <option>Catfish</option>
                         <option>Croaker</option>
                         <option>Red Snapper</option>
                         <option>Mackerel</option>
                         <option value="other">New Species...</option>
                      </select>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity to Add (kg)</label>
                      <input 
                        type="number"
                        required
                        min="1"
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
                        placeholder="e.g. 50"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Source / Reason</label>
                      <input 
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        placeholder="e.g. Weekly Supply, Donor"
                        value={newItem.reason}
                        onChange={(e) => setNewItem({...newItem, reason: e.target.value})}
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
                      Confirm Stock
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
