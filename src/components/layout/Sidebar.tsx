"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Orders", icon: ShoppingBag, href: "/orders" },
  { name: "Menu Management", icon: UtensilsCrossed, href: "/menu" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Payments", icon: CreditCard, href: "/payments" },
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
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                  "sidebar-link group relative",
                  isActive && "sidebar-link-active"
                )}
              >
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
                {(isCollapsed && !isMobile) && (
                  <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-white/10 shrink-0 lg:block hidden">
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
    </motion.aside>
  );
}
