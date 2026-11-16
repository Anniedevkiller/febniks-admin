"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ChefHat, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message || "Failed to update password.");
        return;
      }

      // Check admin role before redirecting to dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "admin") {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
          router.push("/login?error=access_denied");
          return;
        }
      }

      toast.success("Password updated successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#F8F9FA] font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-border"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 font-display">FEBNIKS KITCHEN</h1>
            <p className="text-xs text-gray-500 font-medium">Admin Security Recovery</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 font-display mb-2">Set New Password</h2>
          <p className="text-sm text-gray-500 font-medium">
            Enter and confirm your new administrator password below.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Confirm New Password
            </label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-4 rounded-xl font-black text-base shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs font-bold text-gray-500 hover:text-primary uppercase tracking-widest">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
