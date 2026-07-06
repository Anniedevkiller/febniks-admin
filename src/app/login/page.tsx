"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ChefHat, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  CloudLightning
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { setSession, getSession } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@febniks.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (getSession()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (email === "admin@febniks.com" && password === "password123") {
        setSession("mock_token_12345");
        toast.success("Welcome back, Admin!");
        router.push("/dashboard");
      } else {
        toast.error("Invalid credentials. Try admin@febniks.com / password123");
      }
      setIsLoading(false);
    }, 1500);
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
                      <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                      <label htmlFor="remember" className="text-sm font-medium text-gray-600">Remember me</label>
                   </div>
                   <button type="button" className="text-sm font-bold text-primary hover:underline">Forgot Password?</button>
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
    </div>
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
