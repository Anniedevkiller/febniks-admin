"use client";

import React from "react";
import { Search, Bell, User, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 bg-white/80 dark:bg-surface/80 backdrop-blur-md border-b border-border h-16 z-40 flex items-center justify-between px-4 sm:px-8 lg:ml-[var(--sidebar-width)] ml-0 transition-all duration-300">
      <div className="flex items-center flex-1 max-w-xl">
        {/* Hamburger Menu Toggle */}
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 mr-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100/50 dark:bg-gray-950/20 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none h-10"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3 sm:space-x-6 ml-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
          <Bell className="w-5 h-5 group-hover:text-primary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white dark:border-surface" />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-border" />

        {/* User Profile */}
        <button className="flex items-center space-x-3 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">Admin Febniks</p>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Super Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
        </button>
      </div>
    </header>
  );
}
