"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ShieldCheck, Building2, CreditCard, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { paymentSettingsSchema } from "@/lib/validations";

export default function PaymentsSettingsPage() {
  const [form, setForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    instructions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/payment-settings");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load payment settings");
        if (json.settings) {
          setForm({
            bank_name: json.settings.bank_name || "",
            account_name: json.settings.account_name || "",
            account_number: json.settings.account_number || "",
            instructions: json.settings.instructions || "",
          });
        }
      } catch (err: any) {
        toast.error(err.message || "Error loading payment settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = paymentSettingsSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please check the fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update payment settings");
      toast.success("Bank transfer payment settings updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save payment settings");
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
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">Payment Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Configure the bank account details shown to customers during checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - Info */}
        <div className="space-y-6">
          <div className="dashboard-card border-none shadow-premium bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-2">
              Manual Bank Transfer
            </h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Customers transfer directly to this bank account and include their Order Number as the transfer narration/remark.
            </p>
            <div className="mt-6 pt-6 border-t border-border/50 space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Live Preview
              </span>
              <p className="text-xs font-bold text-gray-900">{form.bank_name || "—"}</p>
              <p className="text-base font-mono font-black text-primary">
                {form.account_number || "0000000000"}
              </p>
              <p className="text-xs font-semibold text-gray-600">{form.account_name || "—"}</p>
            </div>
          </div>
        </div>

        {/* Right Card - Payment Settings Form (id = 1) */}
        <div className="md:col-span-2">
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs border-b border-border/50 pb-4">
              Receiving Bank Account (Row #1)
            </h3>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">
                Loading payment settings...
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Bank Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. Moniepoint MFB"
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                        value={form.bank_name}
                        onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      10-Digit Account Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type="text"
                        maxLength={10}
                        pattern="\d{10}"
                        placeholder="1234567890"
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-mono font-bold text-sm text-gray-800"
                        value={form.account_number}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            account_number: e.target.value.replace(/\D/g, "").slice(0, 10),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Account Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. FEBNIKS KITCHEN LTD"
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-sm text-gray-800"
                        value={form.account_name}
                        onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Transfer Instructions for Customers
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <textarea
                        rows={3}
                        placeholder="Use your Order Number as the transfer remark and upload your receipt."
                        className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-medium text-sm text-gray-800 resize-none"
                        value={form.instructions}
                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
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
                    {saving ? "Saving..." : "Save Payment Settings"}
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
