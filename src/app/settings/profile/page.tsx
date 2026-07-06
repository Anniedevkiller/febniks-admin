"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState({
    name: "Admin Febniks",
    email: "admin@febniks.com",
    phone: "+234 812 345 6789",
    location: "Lagos, Nigeria",
    bio: "Super Administrator for FEBNIKS KITCHEN. Managing the culinary empire and digital operations.",
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated successfully!");
    }, 1000);
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
          <p className="text-gray-500 mt-1 font-medium">Manage your public profile and login details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - Avatar Upload */}
        <div className="space-y-6">
          <div className="dashboard-card text-center border-none shadow-premium bg-white">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-3xl bg-primary text-white flex items-center justify-center text-5xl font-black shadow-xl shadow-primary/20">
                {profile.name.charAt(0)}
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl border border-border text-gray-400 hover:text-primary transition-all active:scale-90">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-black text-gray-900 text-xl tracking-tight uppercase">{profile.name}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Super Administrator</p>
            <div className="mt-6 pt-6 border-t border-border/50 text-left">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Role Permissions</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[9px] font-black bg-primary/10 text-primary px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Full System Control
                </span>
                <span className="text-[9px] font-black bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Billing Access
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - Form Details */}
        <div className="md:col-span-2">
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs border-b border-border/50 pb-4">Personal Details</h3>
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
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      required
                      type="email"
                      className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bio / Description</label>
                <textarea 
                  rows={4}
                  className="w-full bg-gray-50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800 resize-none"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                />
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
          </div>
        </div>
      </div>
    </div>
  );
}
