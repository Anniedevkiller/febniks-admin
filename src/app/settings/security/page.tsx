"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldAlert, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function SecuritySettingsPage() {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirm: "",
  });

  const [savingPassword, setSavingPassword] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("New passwords do not match!");
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });
      if (error) throw error;
      setPasswords({ newPassword: "", confirm: "" });
      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
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
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">Password & Security</h1>
          <p className="text-gray-500 mt-1 font-medium">Update your administrator password via Supabase Auth.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="dashboard-card border-none shadow-premium bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-2">Admin Access Guard</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Your session is protected by Supabase SSR cookies and role-based access control (<code className="font-mono">profiles.role = &apos;admin&apos;</code>).
            </p>
          </div>
        </div>

        {/* Right Card - Password Reset Form */}
        <div className="md:col-span-2">
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs border-b border-border/50 pb-4">Update Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    minLength={6}
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    minLength={6}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={savingPassword}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-70 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
