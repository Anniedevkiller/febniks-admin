"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldAlert, Save, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("New passwords do not match!");
      return;
    }
    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswords({ current: "", newPassword: "", confirm: "" });
      toast.success("Password updated successfully!");
    }, 1000);
  };

  const handleTfaToggle = () => {
    const newState = !tfaEnabled;
    setTfaEnabled(newState);
    if (newState) {
      toast.success("Two-Factor Authentication (2FA) enabled.");
    } else {
      toast.warning("Two-Factor Authentication (2FA) disabled.");
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
          <p className="text-gray-500 mt-1 font-medium">Update password and enable 2FA security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - 2FA Info */}
        <div className="space-y-6">
          <div className="dashboard-card border-none shadow-premium bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-2">Two-Factor Auth</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
              Protect your account by adding an additional layer of security. Verify login attempts using an authenticator app.
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-border/50">
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest">
                {tfaEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                type="button"
                onClick={handleTfaToggle}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
                  tfaEnabled ? "bg-primary" : "bg-gray-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    tfaEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Card - Password Reset Form */}
        <div className="md:col-span-2">
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs border-b border-border/50 pb-4">Update Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
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
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
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
