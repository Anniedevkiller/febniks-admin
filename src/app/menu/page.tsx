"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  ChevronDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const initialMenuItems = [
  { id: 1, name: "Spicy Grilled Fish", category: "Grills", price: "₦5,500", status: "In Stock", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=200&h=200", available: true },
  { id: 2, name: "Jollof Rice Special", category: "Rice Dishes", price: "₦3,500", status: "In Stock", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=200&h=200", available: true },
  { id: 3, name: "Fisherman Soup", category: "Soups", price: "₦7,000", status: "Low Stock", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200&h=200", available: true },
  { id: 4, name: "Catfish Pepper Soup", category: "Soups", price: "₦4,500", status: "Sold Out", image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=200&h=200", available: false },
  { id: 5, name: "Plantain & Gizzard", category: "Appetizers", price: "₦2,800", status: "In Stock", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=200&h=200", available: true },
  { id: 6, name: "Fried Yam & Sauce", category: "Swallow & Sides", price: "₦2,200", status: "In Stock", image: "https://images.unsplash.com/photo-1512058560366-cd2429598632?auto=format&fit=crop&q=80&w=200&h=200", available: true },
];

const categories = ["All Categories", "Grills", "Rice Dishes", "Soups", "Appetizers", "Swallow & Sides"];

export default function MenuPage() {
  const [items, setItems] = useState(initialMenuItems);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Grills",
    price: "",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"
  });

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "All Categories" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const id = items.length + 1;
    const itemToAdd = { ...newItem, id, available: true, price: `₦${newItem.price.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` };
    setItems([...items, itemToAdd]);
    setIsModalOpen(false);
    setNewItem({
        name: "",
        category: "Grills",
        price: "",
        status: "In Stock",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"
    });
    toast.success(`${newItem.name} added to menu!`);
  };

  const handleDelete = (id: number) => {
    const itemToDelete = items.find(i => i.id === id);
    setItems(items.filter(item => item.id !== id));
    toast.error(`${itemToDelete?.name} removed from menu`);
  };

  const toggleAvailability = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
    const item = items.find(i => i.id === id);
    toast.info(`${item?.name} is now ${!item?.available ? 'Available' : 'Unavailable'}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Menu Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Organize your food items, prices, and availability.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 font-bold"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none h-11 font-medium"
            />
          </div>
          <button className="p-2.5 bg-white border border-border rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
            {filteredItems.map((item) => (
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id} 
                className="dashboard-card group !p-0 overflow-hidden flex flex-col hover:border-primary/30 transition-all"
            >
                {/* Image Placeholder */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm hover:text-primary transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className={cn(
                    "absolute bottom-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight shadow-sm border",
                    item.status === "In Stock" ? "bg-green-50 text-green-600 border-green-200" :
                    item.status === "Low Stock" ? "bg-orange-50 text-orange-600 border-orange-200" :
                    "bg-red-50 text-red-600 border-red-200"
                )}>
                    {item.status}
                </div>
                {!item.available && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white font-black uppercase tracking-widest text-sm border-2 border-white px-4 py-1 rounded-md rotate-[-5deg]">Unavailable</span>
                    </div>
                )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                    </div>
                    <div className="text-lg font-black text-gray-900">{item.price}</div>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.available ? "bg-green-500" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    )} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {item.available ? 'Active' : 'Inactive'}
                    </span>
                    </div>
                    
                    <button 
                        onClick={() => toggleAvailability(item.id)}
                        className={cn(
                            "relative w-10 h-5 rounded-full transition-all duration-300",
                            item.available ? "bg-green-500" : "bg-gray-300"
                        )}
                    >
                    <div className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                        item.available ? "right-0.5" : "left-0.5"
                    )} />
                    </button>
                </div>
                </div>
            </motion.div>
            ))}
        </AnimatePresence>

        {/* Add New Item Placeholder Card */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="dashboard-card border-dashed border-2 border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-3 p-8 group hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[300px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-all shadow-sm group-hover:shadow-md group-hover:scale-110">
            <Plus className="w-8 h-8" />
          </div>
          <p className="font-black text-gray-400 uppercase tracking-widest text-xs group-hover:text-primary transition-colors">Add New Food Item</p>
        </button>
      </div>

      {/* Add Item Modal */}
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
                   <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Create Menu Item</h2>
                   <p className="text-xs text-gray-500 font-medium">Capture the details for your new culinary masterpiece.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                   <ChevronDown className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Food Name</label>
                      <input 
                        required
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        placeholder="e.g. Spicy Grilled Tilapia"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      />
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                      <select 
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      >
                         {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price (₦)</label>
                      <input 
                        type="number"
                        required
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        placeholder="5500"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Initial Status</label>
                      <select 
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        value={newItem.status}
                        onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                      >
                         <option>In Stock</option>
                         <option>Low Stock</option>
                         <option>Sold Out</option>
                      </select>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            className="w-full bg-gray-100/50 border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold truncate text-xs"
                            value={newItem.image}
                            onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                        />
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                   <button 
                      type="submit"
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest"
                    >
                      Create Item
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
