"use client";

import React, { useState } from "react";
import { Inter, Outfit } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/lib/ThemeContext";
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
  const isAuthPage = pathname === "/login" || pathname === "/reset-password";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-background min-h-screen text-foreground selection:bg-primary/10">
        <ThemeProvider>
          <Toaster position="top-right" richColors />
          
          {isAuthPage ? (
            <main className="min-h-screen">{children}</main>
          ) : (
            <div className="flex" style={{ "--sidebar-width": isCollapsed ? "80px" : "280px" } as React.CSSProperties}>
              {/* Mobile Sidebar Backdrop Overlay */}
              {isMobileOpen && (
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[45] lg:hidden transition-opacity"
                  onClick={() => setIsMobileOpen(false)}
                />
              )}

              {/* Sidebar */}
              <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 lg:ml-[var(--sidebar-width)] ml-0">
                <Navbar onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />
                
                {/* Page Content */}
                <main className="flex-1 mt-16 p-4 sm:p-8 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
