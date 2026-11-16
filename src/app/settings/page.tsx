"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  CreditCard, 
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import { signOutAdmin } from "@/lib/auth";
import type { Profile } from "@/lib/types";

const sections = [
  { 
    id: "profile", 
    title: "Account Profile", 
    desc: "Manage your administrator name and phone details.", 
    icon: User, 
    color: "bg-blue-100 text-blue-600" 
  },
  { 
    id: "payments", 
    title: "Payment Settings", 
    desc: "Configure bank account name, number, and transfer instructions.", 
    icon: CreditCard, 
    color: "bg-primary/10 text-primary" 
  },
  { 
    id: "security", 
    title: "Password & Security", 
    desc: "Update your administrator password.", 
    icon: Shield, 
    color: "bg-green-100 text-green-600" 
  },
  { 
    id: "notifications", 
    title: "Notification Settings", 
    desc: "Configure how you receive alerts and updates.", 
    icon: Bell, 
    color: "bg-orange-100 text-orange-600" 
  },
  { 
    id: "data", 
    title: "Data & Privacy", 
    desc: "Export your data or manage privacy settings.", 
    icon: Database, 
    color: "bg-purple-100 text-purple-600" 
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const json = await res.json();
        setProfile(json.profile || null);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await signOutAdmin();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">System Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Global configuration for FEBNIKS KITCHEN.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Profile Summary */}
        <div className="space-y-6">
          <div className="dashboard-card text-center border-none shadow-premium">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="w-full h-full rounded-3xl bg-primary text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/20">
                {(profile?.full_name || profile?.email || "A").charAt(0).toUpperCase()}
              </div>
            </div>
            <h3 className="font-black text-gray-900 text-xl tracking-tight uppercase">
              {profile?.full_name || "Admin Febniks"}
            </h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              {profile?.email || "Administrator"}
            </p>
            
            <div className="mt-8 pt-8 border-t border-border space-y-3">
              <Link href="/settings/profile" className="block w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center">
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-4 border border-border text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout System
              </button>
            </div>
          </div>

          <div className="dashboard-card bg-[#9B2226] text-white p-8 overflow-hidden relative shadow-premium">
            <h4 className="font-black text-lg mb-2 uppercase tracking-tight">Display Preference</h4>
            <p className="text-xs text-white/60 mb-8 font-medium">Adapt the dashboard appearance to your environment.</p>
            <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setTheme("light")}
                className={cn(
                  "flex-1 py-3 rounded-xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all",
                  theme === "light" 
                    ? "bg-white text-gray-900 shadow-lg" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button 
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex-1 py-3 rounded-xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all",
                  theme === "dark" 
                    ? "bg-white text-gray-900 shadow-lg" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 text-white opacity-[0.05]">
              <Sun className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Right Side - Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-card !p-0 overflow-hidden border-none shadow-premium">
            <div className="px-8 py-6 border-b border-border bg-gray-50/50">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Global Configuration</h3>
            </div>
            <div className="divide-y divide-border/50">
              {sections.map((section) => (
                <Link href={`/settings/${section.id}`} key={section.id} className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-transparent group-hover:border-white transition-all", section.color)}>
                      <section.icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors tracking-tight uppercase">{section.title}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{section.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-all group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="dashboard-card border-none shadow-premium bg-gradient-to-br from-white to-gray-50">
            <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs">Infrastructure Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Supabase Auth & RLS</span>
                </div>
                <span className="text-[10px] font-black text-green-500">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Realtime Sync</span>
                </div>
                <span className="text-[10px] font-black text-blue-500">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
