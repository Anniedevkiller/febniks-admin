"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/admin/profile");
        const json = await res.json();
        if (res.ok && json.profile) {
          setProfile({
            full_name: json.profile.full_name || "",
            email: json.profile.email || "",
            phone: json.profile.phone || "",
            role: json.profile.role || "admin",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile");
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/settings"
          className="p-3 bg-white hover:bg-gray-50 border border-border text-gray-500 hover:text-gray-900 rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">Account Profile</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your administrator profile details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card */}
        <div className="space-y-6">
          <div className="dashboard-card text-center border-none shadow-premium bg-white">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-3xl bg-primary text-white flex items-center justify-center text-5xl font-black shadow-xl shadow-primary/20">
                {(profile.full_name || profile.email || "A").charAt(0).toUpperCase()}
              </div>
            </div>
            <h3 className="font-black text-gray-900 text-xl tracking-tight uppercase">
              {profile.full_name || "Admin"}
            </h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              {profile.role}
            </p>
          </div>
        </div>

        {/* Right Card - Form Details */}
        <div className="md:col-span-2">
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs border-b border-border/50 pb-4">Personal Details</h3>
            {loading ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading profile...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        required
                        type="text"
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address (Read-only)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        disabled
                        type="email"
                        className="w-full bg-gray-100 border border-border rounded-xl py-3.5 pl-12 pr-4 font-bold text-sm text-gray-500 cursor-not-allowed"
                        value={profile.email}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text"
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-70 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
