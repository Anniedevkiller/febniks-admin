"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ChefHat, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  CloudLightning,
  AlertCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

function LoginFormContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const savedEmail = localStorage.getItem("febniks_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    const errParam = searchParams.get("error");
    if (errParam === "access_denied") {
      setErrorMsg("Access denied. Your account does not have administrator privileges.");
      toast.error("Access denied");
    } else if (errParam === "invalid_recovery_link") {
      setErrorMsg("Password recovery link is invalid or has expired.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        const msg = error?.message || "Invalid email or password.";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      // Check admin role in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        const deniedMsg = "Access denied. Only administrators can sign in here.";
        setErrorMsg(deniedMsg);
        toast.error("Access denied");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("febniks_remember_email", email.trim());
      } else {
        localStorage.removeItem("febniks_remember_email");
      }

      toast.success(`Welcome back, ${profile.full_name || "Admin"}!`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      toast.error("Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsResetting(true);
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const redirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback?next=/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        { redirectTo }
      );

      if (error) {
        toast.error(error.message || "Failed to send password reset email.");
        return;
      }

      toast.success("Password reset link sent! Check your email inbox.");
      setShowForgotModal(false);
      setResetEmail("");
    } catch {
      toast.error("Failed to send reset email.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FA] font-sans selection:bg-primary/20">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-sidebar overflow-hidden items-center justify-center p-20">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
         <div className="z-10 text-white max-w-xl">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
            >
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center">
                    <ChefHat className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-black font-display tracking-tight">FEBNIKS KITCHEN</h1>
               </div>
               <h2 className="text-6xl font-black font-display mb-6 leading-tight">Master Your <span className="text-accent">Culinary</span> Empire.</h2>
               <p className="text-white/70 text-lg font-medium leading-relaxed mb-10">
                  Manage orders, track inventory, and engage with customers through our elite administrative suite. 
                  Designed for speed, precision, and growth.
               </p>

               <div className="grid grid-cols-2 gap-6">
                  <FeatureItem icon={ShieldCheck} title="Verified Security" desc="Bank-grade encryption for all transactions." />
                  <FeatureItem icon={CloudLightning} title="Real-time Sync" desc="Instant updates across all dashboard modules." />
               </div>
            </motion.div>
         </div>
         
         {/* Background Decoration */}
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
         <div className="absolute top-20 right-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
             <div className="lg:hidden flex items-center gap-3 mb-10">
                <ChefHat className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-black text-primary font-display">FEBNIKS</h1>
             </div>

             <div className="mb-10">
                <h3 className="text-3xl font-black text-gray-900 font-display mb-2">Sign In</h3>
                <p className="text-gray-500 font-medium">Please enter your credentials to access the admin panel.</p>
             </div>

             {errorMsg && (
               <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm font-semibold">
                 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                 <span>{errorMsg}</span>
               </div>
             )}

             <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                      placeholder="admin@febniks.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl py-4 pl-12 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
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

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="remember" className="text-sm font-medium text-gray-600">Remember me</label>
                   </div>
                   <button
                     type="button"
                     onClick={() => {
                       setResetEmail(email);
                       setShowForgotModal(true);
                     }}
                     className="text-sm font-bold text-primary hover:underline"
                   >
                     Forgot Password?
                   </button>
                </div>

                <button 
                   disabled={isLoading}
                   className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                   {isLoading ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                   ) : (
                      <>
                        <span>Secure Login</span>
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                      </>
                   )}
                </button>
             </form>

             <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">© 2026 Febniks Kitchen</p>
                <div className="flex gap-4">
                   <button type="button" className="text-[10px] text-gray-400 font-black hover:text-primary transition-colors uppercase tracking-tighter">Support</button>
                   <button type="button" className="text-[10px] text-gray-400 font-black hover:text-primary transition-colors uppercase tracking-tighter">Privacy</button>
                </div>
             </div>
          </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 font-display">Reset Password</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    We will send a password reset link to your admin email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@febniks.com"
                      className="w-full bg-gray-50 border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-70"
                  >
                    {isResetting ? "Sending..." : "Send Reset Link"}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA]" />}>
      <LoginFormContent />
    </Suspense>
  );
}

function FeatureItem({ icon: Icon, title, desc }: any) {
   return (
      <div className="flex gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
         <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-accent" />
         </div>
         <div>
            <h4 className="font-bold text-white text-sm mb-0.5">{title}</h4>
            <p className="text-white/50 text-xs leading-tight">{desc}</p>
         </div>
      </div>
   );
}
