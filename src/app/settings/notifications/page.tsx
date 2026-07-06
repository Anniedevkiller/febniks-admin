"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Mail, Smartphone, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsSettingsPage() {
  const [notifications, setNotifications] = useState({
    emailNewOrders: true,
    emailUserSignups: false,
    emailSystemAlerts: true,
    emailWeeklyDigests: true,
    pushNewOrders: true,
    pushUserSignups: true,
    pushSystemAlerts: true,
    pushWeeklyDigests: false,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Notification preferences updated!");
    }, 1000);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationOptions = [
    {
      id: "NewOrders",
      title: "New Orders",
      desc: "Get notified when a customer places a new food order.",
    },
    {
      id: "UserSignups",
      title: "User Signups",
      desc: "Receive alerts when new staff or managers register.",
    },
    {
      id: "SystemAlerts",
      title: "System Alerts",
      desc: "Get critical warnings about database sync, API uptime, or server load.",
    },
    {
      id: "WeeklyDigests",
      title: "Weekly Digests",
      desc: "Receive a compiled summary of kitchen analytics and revenue performance.",
    },
  ];

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
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">Notification Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Configure how you receive alerts and updates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="dashboard-card border-none shadow-premium bg-white !p-0 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-8 py-6 border-b border-border bg-gray-50/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest sm:col-span-1">Notification Event</span>
              <div className="flex items-center gap-8 sm:col-span-2 sm:justify-end">
                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 justify-center">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 justify-center">
                  <Smartphone className="w-3.5 h-3.5" /> Push
                </span>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-border/50">
              {notificationOptions.map((opt) => {
                const emailKey = `email${opt.id}` as keyof typeof notifications;
                const pushKey = `push${opt.id}` as keyof typeof notifications;

                return (
                  <div key={opt.id} className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-8 py-6 items-center">
                    {/* Event Description */}
                    <div className="text-left sm:col-span-1">
                      <p className="text-sm font-black text-gray-900 tracking-tight uppercase">{opt.title}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{opt.desc}</p>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-8 sm:col-span-2 sm:justify-end">
                      {/* Email Switch */}
                      <button
                        type="button"
                        onClick={() => toggleNotification(emailKey)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
                          notifications[emailKey] ? "bg-primary" : "bg-gray-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                            notifications[emailKey] ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>

                      {/* Push Switch */}
                      <button
                        type="button"
                        onClick={() => toggleNotification(pushKey)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
                          notifications[pushKey] ? "bg-primary" : "bg-gray-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                            notifications[pushKey] ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-70 active:scale-95"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
