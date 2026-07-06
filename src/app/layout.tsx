"use client";

import React, { useState } from "react";
import { Inter, Outfit } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-background min-h-screen text-foreground selection:bg-primary/10">
        <Toaster position="top-right" richColors />
        
        {isLoginPage ? (
          <main className="min-h-screen">{children}</main>
        ) : (
          <div className="flex" style={{ "--sidebar-width": isCollapsed ? "80px" : "280px" } as React.CSSProperties}>
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ml-[var(--sidebar-width)]">
              <Navbar />
              
              {/* Page Content */}
              <main className="flex-1 mt-16 p-8 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
