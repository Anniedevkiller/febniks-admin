"use client";

import React, { useState } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Camera,
  CheckCircle2,
  UserPlus, 
  Settings as SettingsIcon, 
  Trash2, 
  Check, 
  X, 
  Lock,
  Unlock,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

const sections = [
  { 
    id: "profile", 
    title: "Account Profile", 
    desc: "Manage your public profile and login details.", 
    icon: User, 
    color: "bg-blue-100 text-blue-600" 
  },
  { 
    id: "notifications", 
    title: "Notification Settings", 
    desc: "Configure how you receive alerts and updates.", 
    icon: Bell, 
    color: "bg-orange-100 text-orange-600" 
  },
  { 
    id: "security", 
    title: "Password & Security", 
    desc: "Update password and enable 2FA security.", 
    icon: Shield, 
    color: "bg-green-100 text-green-600" 
  },
  { 
    id: "payments", 
    title: "Payment Integration", 
    desc: "Manage Paystack and Flutterwave API keys.", 
    icon: CreditCard, 
    color: "bg-primary/10 text-primary" 
  },
  { 
    id: "data", 
    title: "Data & Privacy", 
    desc: "Export your data or manage privacy settings.", 
    icon: Database, 
    color: "bg-purple-100 text-purple-600" 
  },
];

const initialTeam = [
  { id: 1, name: "Admin Febniks", email: "admin@febniks.com", role: "Super Admin", status: "Active", lastSeen: "Online", permissions: ["All"] },
  { id: 2, name: "Sarah Manager", email: "sarah@febniks.com", role: "Manager", status: "Active", lastSeen: "2h ago", permissions: ["Orders", "Menu", "Support"] },
  { id: 3, name: "John Staff", email: "john@febniks.com", role: "Staff", status: "Inactive", lastSeen: "Yesterday", permissions: ["Orders"] },
];

const availablePermissions = ["Orders", "Menu", "Inventory", "Payments", "Analytics", "Support"];

export default function SettingsPage() {
const [team, setTeam] = useState<any[]>(initialTeam);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Staff",
    permissions: [] as string[]
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const id = team.length + 1;
    const memberToAdd = {
      ...newMember,
      id,
      status: "Active",
      lastSeen: "Just now",
      permissions: newMember.role === "Super Admin" ? ["All"] : newMember.permissions
    };
    setTeam([...team, memberToAdd]);
    setIsModalOpen(false);
    setNewMember({ name: "", email: "", role: "Staff", permissions: [] });
    toast.success(`Account created for ${newMember.name}`);
  };

  const togglePermission = (perm: string) => {
    setNewMember((prev: any) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p: string) => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const deleteMember = (id: number) => {
    if (id === 1) {
        toast.error("Cannot remove Super Admin");
        return;
    }
    setTeam(team.filter((m: any) => m.id !== id));
    toast.error("Team member removed");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight">System Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Global configuration and team management for FEBNIKS KITCHEN.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
           <button 
              onClick={() => setActiveTab("general")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "general" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
             General
           </button>
           <button 
              onClick={() => setActiveTab("team")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "team" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
             Team & Permissions
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "general" ? (
          <motion.div 
            key="general"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Side - Profile Summary */}
            <div className="space-y-6">
               <div className="dashboard-card text-center border-none shadow-premium">
                  <div className="relative w-28 h-28 mx-auto mb-6">
                     <div className="w-full h-full rounded-3xl bg-primary text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/20">
                       A
                     </div>
                     <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl border border-border text-gray-400 hover:text-primary transition-all active:scale-90">
                        <Camera className="w-5 h-5" />
                     </button>
                  </div>
                  <h3 className="font-black text-gray-900 text-xl tracking-tight uppercase">Admin Febniks</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Super Administrator</p>
                  
                  <div className="mt-8 pt-8 border-t border-border space-y-3">
                     <Link href="/settings/profile" className="block w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center">Edit Profile</Link>
                     <button className="w-full py-4 border border-border text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout System
                     </button>
                  </div>
               </div>

               <div className="dashboard-card bg-[#9B2226] text-white p-8 overflow-hidden relative shadow-premium">
                  <h4 className="font-black text-lg mb-2 uppercase tracking-tight">Display Preference</h4>
                  <p className="text-xs text-white/60 mb-8 font-medium">Adapt the dashboard appearance to your environment.</p>
                  <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                     <button className="flex-1 py-3 rounded-xl bg-white text-gray-900 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest shadow-lg transition-all">
                        <Sun className="w-4 h-4" /> Light
                     </button>
                     <button className="flex-1 py-3 rounded-xl text-white/60 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all hover:text-white">
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
                     <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-green-100 shadow-sm group hover:border-green-300 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                             <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <span className="text-xs font-black text-gray-900 uppercase tracking-widest">API Engine</span>
                        </div>
                        <span className="text-[10px] font-black text-green-500">OPTIMAL</span>
                     </div>
                     <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-blue-100 shadow-sm group hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                             <Globe className="w-5 h-5" />
                           </div>
                           <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Database</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-500">SYNCED</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="team"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-border">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight">Team Management</h3>
                        <p className="text-xs text-gray-500 font-medium">Control who has access to the dashboard components.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    New Account
                </button>
            </div>

            <div className="dashboard-card !p-0 overflow-hidden border-none shadow-premium">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-border">
                                <th className="px-8 py-5 text-left">Member</th>
                                <th className="px-4 py-5">Role</th>
                                <th className="px-4 py-5">Status</th>
                                <th className="px-4 py-5">Permissions</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                    <tbody className="divide-y divide-border/50">
                            {team.map((member: any) => (
                                <tr key={member.id} className="hover:bg-gray-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm uppercase">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-sm tracking-tight">{member.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{member.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <span className={cn(
                                            "text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border",
                                            member.role === "Super Admin" ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full ring-4 ring-opacity-20", member.status === "Active" ? "bg-green-500 ring-green-100" : "bg-gray-300 ring-gray-100")} />
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{member.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {member.permissions.map((p: string) => (
                                                <span key={p} className="text-[9px] font-black bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2.5 hover:bg-white border hover:border-border rounded-xl text-gray-400 hover:text-primary transition-all">
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => deleteMember(member.id)}
                                                className="p-2.5 hover:bg-white border hover:border-border rounded-xl text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="px-8 py-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 font-display uppercase tracking-tight">Create New Account</h2>
                        <p className="text-xs text-gray-500 font-medium">Setup credentials and permission levels.</p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                   <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Name</label>
                      <input 
                        required
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        placeholder="e.g. Samuel Ade"
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email"
                        required
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        placeholder="samuel@febniks.com"
                        value={newMember.email}
                        onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assign Role</label>
                      <select 
                        className="w-full bg-gray-100/50 border border-border rounded-xl py-3.5 px-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        value={newMember.role}
                        onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                      >
                         <option>Staff</option>
                         <option>Manager</option>
                         <option>Super Admin</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Access Permissions</label>
                    {newMember.role === "Super Admin" ? (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                            <Lock className="w-8 h-8 text-primary" />
                            <p className="text-xs font-black text-primary uppercase tracking-widest">Full System Access</p>
                            <p className="text-[10px] text-gray-500 font-medium">Super admins have master keys to all dashboard modules by default.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {availablePermissions.map(perm => (
                                <button
                                    key={perm}
                                    type="button"
                                    onClick={() => togglePermission(perm)}
                                    className={cn(
                                        "px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all flex items-center justify-between",
                                        newMember.permissions.includes(perm) 
                                            ? "bg-primary/10 border-primary text-primary" 
                                            : "bg-white border-border text-gray-400 hover:border-gray-500"
                                    )}
                                >
                                    {perm}
                                    {newMember.permissions.includes(perm) ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 flex gap-4 pt-4">
                   <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                   <button 
                      type="submit"
                      className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest"
                    >
                      Create Account
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
