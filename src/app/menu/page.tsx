"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronDown,
  Image as ImageIcon,
  Star,
  Upload,
  FolderPlus,
  Loader2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Category, Meal } from "@/lib/types";
import { slugify } from "@/lib/validations";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400";

export default function MenuPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Meal Modal State (Create & Edit)
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [mealForm, setMealForm] = useState({
    name: "",
    slug: "",
    category_id: "",
    price: "",
    description: "",
    image_url: "",
    is_available: true,
    is_featured: false,
  });

  // Category Modal State (Manage Categories)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    sort_order: 0,
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, mealRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/meals"),
      ]);
      const catJson = await catRes.json();
      const mealJson = await mealRes.json();

      if (!catRes.ok) throw new Error(catJson.error || "Failed to load categories");
      if (!mealRes.ok) throw new Error(mealJson.error || "Failed to load meals");

      setCategories(catJson.categories || []);
      setMeals(mealJson.meals || []);
    } catch (err: any) {
      toast.error(err.message || "Error loading menu data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMeals = meals.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category_id === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openCreateMealModal = () => {
    setEditingMeal(null);
    setMealForm({
      name: "",
      slug: "",
      category_id: categories[0]?.id || "",
      price: "",
      description: "",
      image_url: "",
      is_available: true,
      is_featured: false,
    });
    setIsMealModalOpen(true);
  };

  const openEditMealModal = (meal: Meal) => {
    setEditingMeal(meal);
    setMealForm({
      name: meal.name,
      slug: meal.slug,
      category_id: meal.category_id || "",
      price: String(meal.price),
      description: meal.description || "",
      image_url: meal.image_url || "",
      is_available: meal.is_available,
      is_featured: meal.is_featured,
    });
    setIsMealModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5 MB limit.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/meals/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }
      setMealForm((prev) => ({ ...prev, image_url: json.image_url }));
      toast.success("Photo uploaded to meal-images!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeal(true);
    try {
      const payload = {
        name: mealForm.name.trim(),
        slug: (mealForm.slug || slugify(mealForm.name)).trim(),
        category_id: mealForm.category_id || null,
        price: Number(mealForm.price),
        description: mealForm.description.trim() || null,
        image_url: mealForm.image_url.trim() || null,
        is_available: mealForm.is_available,
        is_featured: mealForm.is_featured,
      };

      const url = editingMeal
        ? `/api/admin/meals/${editingMeal.id}`
        : "/api/admin/meals";
      const method = editingMeal ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save meal");
      }

      if (editingMeal) {
        setMeals((prev) =>
          prev.map((m) => (m.id === editingMeal.id ? json.meal : m))
        );
        toast.success(`${json.meal.name} updated!`);
      } else {
        setMeals((prev) => [...prev, json.meal]);
        toast.success(`${json.meal.name} added to menu!`);
      }
      setIsMealModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save meal");
    } finally {
      setIsSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (meal: Meal) => {
    if (!window.confirm(`Delete "${meal.name}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/admin/meals/${meal.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete meal");
      setMeals((prev) => prev.filter((m) => m.id !== meal.id));
      toast.success(`${meal.name} removed from menu`);
    } catch (err: any) {
      toast.error(err.message || "Error deleting meal");
    }
  };

  const toggleAvailability = async (meal: Meal) => {
    const nextVal = !meal.is_available;
    setMeals((prev) =>
      prev.map((m) => (m.id === meal.id ? { ...m, is_available: nextVal } : m))
    );
    try {
      const res = await fetch(`/api/admin/meals/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: nextVal }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update availability");
      setMeals((prev) => prev.map((m) => (m.id === meal.id ? json.meal : m)));
      toast.info(`${meal.name} is now ${nextVal ? "Available" : "Unavailable"}`);
    } catch (err: any) {
      setMeals((prev) =>
        prev.map((m) => (m.id === meal.id ? { ...m, is_available: !nextVal } : m))
      );
      toast.error(err.message || "Could not update availability");
    }
  };

  const toggleFeatured = async (meal: Meal) => {
    const nextVal = !meal.is_featured;
    setMeals((prev) =>
      prev.map((m) => (m.id === meal.id ? { ...m, is_featured: nextVal } : m))
    );
    try {
      const res = await fetch(`/api/admin/meals/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: nextVal }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update featured status");
      setMeals((prev) => prev.map((m) => (m.id === meal.id ? json.meal : m)));
      toast.info(
        `${meal.name} ${nextVal ? "marked as Featured" : "removed from Featured"}`
      );
    } catch (err: any) {
      setMeals((prev) =>
        prev.map((m) => (m.id === meal.id ? { ...m, is_featured: !nextVal } : m))
      );
      toast.error(err.message || "Could not update featured status");
    }
  };

  // Category CRUD handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCategory(true);
    try {
      const payload = {
        name: categoryForm.name.trim(),
        slug: (categoryForm.slug || slugify(categoryForm.name)).trim(),
        sort_order: Number(categoryForm.sort_order) || 0,
        is_active: categoryForm.is_active,
      };
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save category");

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? json.category : c))
        );
        toast.success(`Category "${json.category.name}" updated!`);
      } else {
        setCategories((prev) => [...prev, json.category]);
        toast.success(`Category "${json.category.name}" created!`);
      }
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        slug: "",
        sort_order: categories.length + 1,
        is_active: true,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete category");
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      if (activeCategory === cat.id) setActiveCategory("all");
      toast.success(`Category "${cat.name}" deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Menu Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Organize your food items, categories, prices, and availability.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({
                name: "",
                slug: "",
                sort_order: categories.length + 1,
                is_active: true,
              });
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-border text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <FolderPlus className="w-5 h-5 text-primary" />
            <span>Categories ({categories.length})</span>
          </button>
          <button 
            onClick={openCreateMealModal}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl w-fit max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
              activeCategory === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 font-bold"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5",
                activeCategory === cat.id 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 font-bold"
              )}
            >
              <span>{cat.name}</span>
              {!cat.is_active && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 uppercase">
                  Hidden
                </span>
              )}
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
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="dashboard-card h-[320px] animate-pulse bg-gray-100/60" />
          ))}
        </div>
      ) : (
        /* Menu Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMeals.map((item) => {
              const categoryName =
                item.categories?.name ||
                categories.find((c) => c.id === item.category_id)?.name ||
                "Uncategorized";

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id} 
                  className="dashboard-card group !p-0 overflow-hidden flex flex-col hover:border-primary/30 transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img 
                      src={item.image_url || FALLBACK_IMAGE} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <button
                        onClick={() => toggleFeatured(item)}
                        title={item.is_featured ? "Featured Meal" : "Mark as Featured"}
                        className={cn(
                          "p-2 backdrop-blur-md rounded-lg shadow-sm transition-colors",
                          item.is_featured
                            ? "bg-amber-400 text-white"
                            : "bg-white/90 text-gray-500 hover:text-amber-500"
                        )}
                      >
                        <Star className={cn("w-3.5 h-3.5", item.is_featured && "fill-current")} />
                      </button>
                      <button
                        onClick={() => openEditMealModal(item)}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMeal(item)}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className={cn(
                      "absolute bottom-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight shadow-sm border z-10",
                      item.is_available
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    )}>
                      {item.is_available ? "In Stock" : "Sold Out"}
                    </div>
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white font-black uppercase tracking-widest text-sm border-2 border-white px-4 py-1 rounded-md rotate-[-5deg]">Unavailable</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                          {categoryName}
                        </p>
                      </div>
                      <div className="text-lg font-black text-gray-900 shrink-0">
                        ₦{Number(item.price).toLocaleString()}
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          item.is_available ? "bg-green-500" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        )} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {item.is_available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => toggleAvailability(item)}
                        className={cn(
                          "relative w-10 h-5 rounded-full transition-all duration-300",
                          item.is_available ? "bg-green-500" : "bg-gray-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                          item.is_available ? "right-0.5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add New Item Placeholder Card */}
          <button 
            onClick={openCreateMealModal}
            className="dashboard-card border-dashed border-2 border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-3 p-8 group hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[300px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-all shadow-sm group-hover:shadow-md group-hover:scale-110">
              <Plus className="w-8 h-8" />
            </div>
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs group-hover:text-primary transition-colors">Add New Food Item</p>
          </button>
        </div>
      )}

      {/* Create / Edit Meal Modal */}
      <AnimatePresence>
        {isMealModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-border my-8"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">
                    {editingMeal ? "Edit Menu Item" : "Create Menu Item"}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Changes sync immediately with the customer ordering site.
                  </p>
                </div>
                <button onClick={() => setIsMealModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                  <ChevronDown className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <form onSubmit={handleSaveMeal} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Food Name</label>
                    <input 
                      required
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      placeholder="e.g. Spicy Grilled Tilapia"
                      value={mealForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setMealForm((prev) => ({
                          ...prev,
                          name,
                          slug: editingMeal ? prev.slug : slugify(name),
                        }));
                      }}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Slug</label>
                    <input 
                      required
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono text-xs"
                      placeholder="spicy-grilled-tilapia"
                      value={mealForm.slug}
                      onChange={(e) => setMealForm({ ...mealForm, slug: slugify(e.target.value) })}
                    />
                  </div>
                   
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                    <select 
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      value={mealForm.category_id}
                      onChange={(e) => setMealForm({ ...mealForm, category_id: e.target.value })}
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price (₦)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      step="any"
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                      placeholder="5500"
                      value={mealForm.price}
                      onChange={(e) => setMealForm({ ...mealForm, price: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      rows={2}
                      className="w-full bg-gray-100/50 border border-border rounded-xl py-3 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm resize-none"
                      placeholder="Freshly grilled fish served with spicy pepper sauce..."
                      value={mealForm.description}
                      onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                    />
                  </div>

                  {/* Photo Upload to meal-images bucket */}
                  <div className="col-span-2 space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Meal Photo (JPG/PNG/WebP, max 5 MB)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-primary/20 transition-colors shrink-0">
                        {isUploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>{isUploadingImage ? "Uploading..." : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          className="w-full bg-gray-100/50 border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-xs"
                          placeholder="Or paste image URL..."
                          value={mealForm.image_url}
                          onChange={(e) => setMealForm({ ...mealForm, image_url: e.target.value })}
                        />
                      </div>
                    </div>
                    {mealForm.image_url && (
                      <div className="mt-2 relative w-28 h-20 rounded-xl overflow-hidden border border-border">
                        <img
                          src={mealForm.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-between pt-2 gap-4">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mealForm.is_available}
                        onChange={(e) => setMealForm({ ...mealForm, is_available: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-bold text-gray-700">Available for Ordering</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mealForm.is_featured}
                        onChange={(e) => setMealForm({ ...mealForm, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-bold text-gray-700">Featured on Homepage</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsMealModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingMeal || isUploadingImage}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest disabled:opacity-60"
                  >
                    {isSavingMeal
                      ? "Saving..."
                      : editingMeal
                      ? "Save Changes"
                      : "Create Item"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-border my-8"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">
                    Manage Categories
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Create, reorder, or toggle menu categories.
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Category Create / Edit Form */}
                <form onSubmit={handleSaveCategory} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-600">
                      {editingCategory ? `Editing: ${editingCategory.name}` : "Add New Category"}
                    </h3>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryForm({
                            name: "",
                            slug: "",
                            sort_order: categories.length + 1,
                            is_active: true,
                          });
                        }}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      required
                      placeholder="Category Name"
                      value={categoryForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setCategoryForm((prev) => ({
                          ...prev,
                          name,
                          slug: editingCategory ? prev.slug : slugify(name),
                        }));
                      }}
                      className="bg-white border border-border rounded-xl py-2.5 px-3 text-sm font-bold outline-none"
                    />
                    <input
                      required
                      placeholder="slug"
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, slug: slugify(e.target.value) })
                      }
                      className="bg-white border border-border rounded-xl py-2.5 px-3 text-xs font-mono outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Sort Order"
                      value={categoryForm.sort_order}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })
                      }
                      className="bg-white border border-border rounded-xl py-2.5 px-3 text-sm font-bold outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryForm.is_active}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, is_active: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span>Active on site</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSavingCategory}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-60"
                    >
                      {isSavingCategory
                        ? "Saving..."
                        : editingCategory
                        ? "Update Category"
                        : "Add Category"}
                    </button>
                  </div>
                </form>

                {/* Existing Categories List */}
                <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                  {categories.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-400 font-medium">
                      No categories yet. Add one above!
                    </p>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{cat.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">/{cat.slug}</span>
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                                cat.is_active
                                  ? "bg-green-50 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              {cat.is_active ? "Active" : "Hidden"}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                            Sort Order: {cat.sort_order}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryForm({
                                name: cat.name,
                                slug: cat.slug,
                                sort_order: cat.sort_order,
                                is_active: cat.is_active,
                              });
                            }}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
