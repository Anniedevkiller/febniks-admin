"use client";

import React from "react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Wallet
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

const transactions = [
  { id: "TXN-9901", customer: "John Doe", method: "Paystack", amount: "₦12,500", status: "Paid", date: "26 Mar, 12:45 PM" },
  { id: "TXN-9902", customer: "Jane Smith", method: "Flutterwave", amount: "₦8,000", status: "Paid", date: "26 Mar, 01:10 PM" },
  { id: "TXN-9903", customer: "Robert Brown", method: "Paystack", amount: "₦5,500", status: "Failed", date: "26 Mar, 01:15 PM" },
  { id: "TXN-9904", customer: "Alice Green", method: "Flutterwave", amount: "₦9,200", status: "Pending", date: "26 Mar, 01:25 PM" },
  { id: "TXN-9905", customer: "Samuel Ade", method: "Paystack", amount: "₦6,500", status: "Paid", date: "26 Mar, 01:30 PM" },
];

const revenueData = [
  { name: "Mon", revenue: 45000 },
  { name: "Tue", revenue: 52000 },
  { name: "Wed", revenue: 48000 },
  { name: "Thu", revenue: 61000 },
  { name: "Fri", revenue: 55000 },
  { name: "Sat", revenue: 85000 },
  { name: "Sun", revenue: 72000 },
];

export default function PaymentsPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Financial Records</h1>
          <p className="text-gray-500 mt-1">Track payments, revenue, and transaction statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            <span>Financial Export</span>
          </button>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Weekly Revenue Trend</h3>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15.2%</span>
            </div>
          </div>
          <div className="p-6 h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="revenue" fill="#E63946" radius={[6, 6, 0, 0]} barSize={40}>
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 5 ? '#E63946' : '#fca5a5'} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-50/50 rounded-xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="dashboard-card flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-400" />
            Method Distribution
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">PS</div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Paystack</p>
                        <p className="text-[10px] text-gray-400 font-medium">65% of transactions</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₦8.4M</p>
                    <p className="text-[10px] text-green-600 font-bold">+5.2%</p>
                </div>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">FW</div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Flutterwave</p>
                        <p className="text-[10px] text-gray-400 font-medium">35% of transactions</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₦4.2M</p>
                    <p className="text-[10px] text-red-500 font-bold">-2.1%</p>
                </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Revenue</p>
            <div className="flex items-end gap-3 font-display">
                <h2 className="text-4xl font-black text-gray-900">₦12.6M</h2>
                <span className="text-green-600 flex items-center gap-1 text-sm font-bold mb-1">
                    <TrendingUp className="w-4 h-4" />
                    +12%
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="dashboard-card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
           <h3 className="font-bold text-gray-900">Recent Transactions</h3>
           <div className="flex items-center gap-3">
             <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search ID..."
                 className="w-full bg-gray-100/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
               />
             </div>
             <button className="p-2 bg-gray-50 border border-border rounded-xl text-gray-500 hover:bg-white transition-colors">
               <Filter className="w-4 h-4" />
             </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-2">Customer</th>
                <th className="py-4 px-2">Gateway</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Status</th>
                <th className="py-4 px-6 text-right">Date/Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-6 font-bold text-gray-900 text-sm tracking-tight">{txn.id}</td>
                  <td className="py-5 px-2">
                    <span className="text-sm font-medium text-gray-600">{txn.customer}</span>
                  </td>
                  <td className="py-5 px-2">
                    <span className={cn(
                      "text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter",
                      txn.method === "Paystack" ? "text-blue-600 bg-blue-50" : "text-orange-600 bg-orange-50"
                    )}>
                      {txn.method}
                    </span>
                  </td>
                  <td className="py-5 px-2">
                    <span className="text-sm font-black text-gray-900">{txn.amount}</span>
                  </td>
                  <td className="py-5 px-2">
                    <div className={cn(
                      "flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-tight shadow-sm",
                      txn.status === "Paid" ? "bg-green-100 text-green-700 border-green-200" : 
                      txn.status === "Pending" ? "bg-orange-100 text-orange-700 border-orange-200" :
                      "bg-red-100 text-red-700 border-red-200"
                    )}>
                      {txn.status === "Paid" ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                       txn.status === "Pending" ? <Clock className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {txn.status}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right text-xs text-gray-400 font-medium">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
