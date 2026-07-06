"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Key, Save, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PaymentsSettingsPage() {
  const [keys, setKeys] = useState({
    paystackPublic: "pk_live_49f82d...b15c",
    paystackSecret: "sk_live_92b0c1...d98a",
    flutterwavePublic: "FLWPUBK-d9a28c...382e-X",
    flutterwaveSecret: "FLWSECK-10c85b...4912-X",
  });

  const [saving, setSaving] = useState(false);
  
  const [showPaystackPub, setShowPaystackPub] = useState(false);
  const [showPaystackSec, setShowPaystackSec] = useState(false);
  const [showFlwPub, setShowFlwPub] = useState(false);
  const [showFlwSec, setShowFlwSec] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("API Keys updated successfully!");
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
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">Payment Integration</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage Paystack and Flutterwave API keys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - Integration Info */}
        <div className="space-y-6">
          <div className="dashboard-card border-none shadow-premium bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-2">Secure API storage</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Your API keys are stored securely using AES-256 encryption. Keep these keys private and do not share them with unauthorized personnel.
            </p>
            <div className="mt-6 pt-6 border-t border-border/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Gateways Available</span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">PS</div>
                  <span className="text-xs font-bold text-gray-700">Paystack Gateway</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">FW</div>
                  <span className="text-xs font-bold text-gray-700">Flutterwave Gateway</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - API Keys Form */}
        <div className="md:col-span-2">
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs border-b border-border/50 pb-4">API Credentials</h3>
            <form onSubmit={handleSave} className="space-y-8">
              {/* Paystack Keys */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Paystack (NGN, GHS)</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Public Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type={showPaystackPub ? "text" : "password"}
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-mono text-xs text-gray-800"
                        value={keys.paystackPublic}
                        onChange={(e) => setKeys({...keys, paystackPublic: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPaystackPub(!showPaystackPub)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPaystackPub ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Secret Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type={showPaystackSec ? "text" : "password"}
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-mono text-xs text-gray-800"
                        value={keys.paystackSecret}
                        onChange={(e) => setKeys({...keys, paystackSecret: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPaystackSec(!showPaystackSec)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPaystackSec ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flutterwave Keys */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Flutterwave (Global)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Public Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type={showFlwPub ? "text" : "password"}
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-mono text-xs text-gray-800"
                        value={keys.flutterwavePublic}
                        onChange={(e) => setKeys({...keys, flutterwavePublic: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFlwPub(!showFlwPub)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showFlwPub ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Secret Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type={showFlwSec ? "text" : "password"}
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-mono text-xs text-gray-800"
                        value={keys.flutterwaveSecret}
                        onChange={(e) => setKeys({...keys, flutterwaveSecret: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowFlwSec(!showFlwSec)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showFlwSec ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                  {saving ? "Saving..." : "Save API Keys"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
