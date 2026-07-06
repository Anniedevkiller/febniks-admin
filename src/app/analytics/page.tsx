"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock, 
  Calendar, 
  Filter, 
  Download,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const performanceData = [
  { name: "Jan", revenue: 4000, orders: 400 },
  { name: "Feb", revenue: 3000, orders: 300 },
  { name: "Mar", revenue: 5000, orders: 500 },
  { name: "Apr", revenue: 2780, orders: 278 },
  { name: "May", revenue: 1890, orders: 189 },
  { name: "Jun", revenue: 2390, orders: 239 },
  { name: "Jul", revenue: 3490, orders: 349 },
];

const peakTimeData = [
  { time: "08 AM", orders: 12 },
  { time: "10 AM", orders: 18 },
  { time: "12 PM", orders: 45 },
  { time: "02 PM", orders: 38 },
  { time: "04 PM", orders: 25 },
  { time: "06 PM", orders: 55 },
  { time: "08 PM", orders: 62 },
  { time: "10 PM", orders: 30 },
];

const categoryData = [
  { name: "Grills", value: 40, color: "#E63946" },
  { name: "Rice Dishes", value: 25, color: "#F4A261" },
  { name: "Soups", value: 20, color: "#9B2226" },
  { name: "Appetizers", value: 15, color: "#2A9D8F" },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Data Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into sales performance and customer behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Select Range</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Area Chart */}
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Revenue Growth Patterns</h3>
            <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">PROJECTION: +24%</div>
          </div>
          <div className="p-6 h-[400px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E63946" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E63946" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#E63946" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="orders" stroke="#9B2226" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Category Share - Pie Chart */}
        <div className="dashboard-card flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-gray-900 mb-6 w-full text-left">Category Distribution</h3>
            <div className="h-[300px] w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      >
                      {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
                )}
            </div>
            <div className="mt-4 pt-6 border-t border-border w-full flex items-center justify-between">
                <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Most Popular</p>
                    <p className="text-lg font-black text-gray-900">Grills (40%)</p>
                </div>
                <div className="p-2 bg-red-100 text-primary rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Times Bar Chart */}
          <div className="dashboard-card">
              <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Peak Order Hours
              </h3>
              <div className="h-[300px] w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakTimeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip cursor={{fill: 'rgba(230, 57, 70, 0.05)'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="orders" fill="#E63946" radius={[4, 4, 4, 4]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
                )}
              </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-2 gap-4">
              <KPICard title="Customer Retention" value="68%" trend="+12%" description="Returning customers this month" icon={Users} color="blue" />
              <KPICard title="Avg. Order Value" value="₦8,450" trend="+5.2%" description="Spent per transaction" icon={ShoppingBag} color="green" />
              <KPICard title="Conversion Rate" value="14.2%" trend="-1.5%" description="Visitors to customers" icon={ArrowUpRight} color="purple" />
              <KPICard title="Support Satisfaction" value="4.8/5" trend="+0.3" description="Admin response rating" icon={Users} color="orange" />
          </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, description, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <div className="dashboard-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", colors[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2 mb-2">
                <h4 className="text-2xl font-black text-gray-900">{value}</h4>
                <span className={cn(
                    "text-[10px] font-black",
                    trend.startsWith("+") ? "text-green-600" : "text-red-600"
                )}>{trend}</span>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-tight">{description}</p>
        </div>
    );
}
