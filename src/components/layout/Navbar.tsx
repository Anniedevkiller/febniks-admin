"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, User, ChevronDown, Menu, LogOut, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signOutAdmin } from "@/lib/auth";
import type { Profile } from "@/lib/types";

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as Profile);
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOutAdmin();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/orders?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 bg-white/80 dark:bg-surface/80 backdrop-blur-md border-b border-border h-16 z-40 flex items-center justify-between px-4 sm:px-8 lg:ml-[var(--sidebar-width)] ml-0 transition-all duration-300">
      <div className="flex items-center flex-1 max-w-xl">
        {/* Hamburger Menu Toggle */}
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 mr-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search orders by number or customer..."
              className="w-full bg-gray-100/50 dark:bg-gray-950/20 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none h-10"
            />
          </div>
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3 sm:space-x-6 ml-4">
        {/* Notifications -> Links to Payment Confirmation Queue */}
        <Link
          href="/payments"
          title="Payment Confirmation Queue"
          className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
        >
          <Bell className="w-5 h-5 group-hover:text-primary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white dark:border-surface" />
        </Link>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-border" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">
                {profile?.full_name || profile?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase">
                {profile?.role || "Admin"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border py-2 z-50"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-border/60">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {profile?.full_name || "Admin"}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{profile?.email}</p>
              </div>
              <Link
                href="/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Account Profile
              </Link>
              <Link
                href="/settings/security"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4 text-gray-400" />
                Password & Security
              </Link>
              <Link
                href="/settings/payments"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Payment Settings
              </Link>
              <div className="border-t border-border/60 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
