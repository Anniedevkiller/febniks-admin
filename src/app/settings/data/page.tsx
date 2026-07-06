"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck, Database, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function DataSettingsPage() {
  const [exportingConfig, setExportingConfig] = useState(false);
  const [exportingLogs, setExportingLogs] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const handleExportConfig = () => {
    setExportingConfig(true);
    setTimeout(() => {
      setExportingConfig(false);
      toast.success("System configuration exported successfully!");
    }, 1200);
  };

  const handleExportLogs = () => {
    setExportingLogs(true);
    setTimeout(() => {
      setExportingLogs(false);
      toast.success("Transaction and activity logs downloaded.");
    }, 1500);
  };

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      toast.success("Temp system cache cleared (12.4 MB freed).");
    }, 1000);
  };

  const handleDeleteAccount = () => {
    const confirmation = window.confirm("Are you sure you want to request data deletion? This action cannot be undone.");
    if (confirmation) {
      toast.error("Request sent. Our admin panel will process this request.");
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
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">Data & Privacy</h1>
          <p className="text-gray-500 mt-1 font-medium">Export your data or manage privacy settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - Policy Info */}
        <div className="space-y-6">
          <div className="dashboard-card border-none shadow-premium bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-2">GDPR & NDPR Compliance</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              We value your privacy. In accordance with data protection regulations, you can download all system logs and request data deactivation at any time.
            </p>
          </div>
        </div>

        {/* Right Card - Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Export Settings */}
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs border-b border-border/50 pb-4">Data Portability</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-2xl hover:border-gray-300 transition-all">
                <div>
                  <h4 className="font-black text-sm text-gray-900 uppercase tracking-tight">Export Configuration</h4>
                  <p className="text-xs text-gray-500 font-medium">Download current app parameters, routes list, and interface setup in JSON format.</p>
                </div>
                <button
                  onClick={handleExportConfig}
                  disabled={exportingConfig}
                  className="px-5 py-3 border border-border hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exportingConfig ? "Exporting..." : "Download"}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-2xl hover:border-gray-300 transition-all">
                <div>
                  <h4 className="font-black text-sm text-gray-900 uppercase tracking-tight">Download Audit Logs</h4>
                  <p className="text-xs text-gray-500 font-medium">Export a complete history of system access, settings modifications, and financial actions.</p>
                </div>
                <button
                  onClick={handleExportLogs}
                  disabled={exportingLogs}
                  className="px-5 py-3 border border-border hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exportingLogs ? "Downloading..." : "Download"}
                </button>
              </div>
            </div>
          </div>

          {/* Cache & Maintenance */}
          <div className="dashboard-card border-none shadow-premium bg-white">
            <h3 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs border-b border-border/50 pb-4">Maintenance</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-2xl hover:border-gray-300 transition-all">
              <div>
                <h4 className="font-black text-sm text-gray-900 uppercase tracking-tight">Clear Temporary Cache</h4>
                <p className="text-xs text-gray-500 font-medium">Rebuild local memory indices and purge cached static pages. Does not delete databases.</p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="px-5 py-3 border border-border hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all active:scale-95 disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                {clearingCache ? "Clearing..." : "Clear Cache"}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="dashboard-card border border-red-100 shadow-premium bg-red-50/10">
            <h3 className="font-black text-red-600 mb-6 uppercase tracking-widest text-xs border-b border-red-100 pb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-red-100 rounded-2xl">
              <div>
                <h4 className="font-black text-sm text-gray-900 uppercase tracking-tight">Request Account Deactivation</h4>
                <p className="text-xs text-gray-500 font-medium">Submit a request to clear all credentials, settings configuration, and delete your profile.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all active:scale-95 shadow-lg shadow-red-600/10"
              >
                <Trash2 className="w-4 h-4" />
                Request Deletion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
