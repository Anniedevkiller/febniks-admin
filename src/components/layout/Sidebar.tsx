"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Users, 
  CreditCard, 
  Fish, 
  BarChart3, 
  HeadphonesIcon, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOutAdmin } from "@/lib/auth";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Orders", icon: ShoppingBag, href: "/orders", showBadge: true },
  { name: "Menu Management", icon: UtensilsCrossed, href: "/menu" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Payments", icon: CreditCard, href: "/payments", showBadge: true },
  { name: "Inventory", icon: Fish, href: "/inventory" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Customer Support", icon: HeadphonesIcon, href: "/support" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [awaitingCount, setAwaitingCount] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAwaitingCount = useCallback(async () => {
    const supabase = createClient();
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "awaiting_confirmation");
    setAwaitingCount(count ?? 0);
  }, []);

  useEffect(() => {
    fetchAwaitingCount();
    const supabase = createClient();
    const channel = supabase
      .channel("sidebar-awaiting-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchAwaitingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAwaitingCount]);

  const handleLogout = async () => {
    await signOutAdmin();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isMobile ? 280 : (isCollapsed ? 80 : 280) 
      }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-white z-50 flex flex-col transition-all duration-300 shadow-xl lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0 overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <UtensilsCrossed className="text-white w-6 h-6" />
          </div>
          {(!isCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display font-bold text-xl tracking-tight"
            >
              FEBNIKS <span className="text-accent">KITCHEN</span>
            </motion.div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-2 -mr-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-link group relative justify-between",
                  isActive && "sidebar-link-active"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-white/60 group-hover:text-white"
                  )} />
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </div>

                {item.showBadge && awaitingCount > 0 && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-black rounded-full transition-all",
                      isActive
                        ? "bg-white text-sidebar"
                        : "bg-accent text-white",
                      isCollapsed && !isMobile && "absolute top-1.5 right-1.5 px-1.5 py-0"
                    )}
                    title={`${awaitingCount} order(s) awaiting payment confirmation`}
                  >
                    {awaitingCount}
                  </span>
                )}

                {(isCollapsed && !isMobile) && (
                  <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                    {item.name}
                    {item.showBadge && awaitingCount > 0 ? ` (${awaitingCount})` : ""}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions: Logout & Collapse Toggle */}
      <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors px-3"
          title="Logout"
        >
          {isCollapsed && !isMobile ? (
            <LogOut className="w-5 h-5" />
          ) : (
            <div className="flex items-center space-x-2 w-full">
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </div>
          )}
        </button>

        <div className="lg:block hidden">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center h-10 rounded-xl hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
              <div className="flex items-center space-x-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse Menu</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
