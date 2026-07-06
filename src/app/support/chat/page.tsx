"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  User, 
  ShoppingBag, 
  Ticket, 
  CheckCheck,
  ChevronLeft,
  Settings,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const chats = [
  { id: 1, name: "John Doe", orderId: "#ORD-7721", lastMsg: "My payment failed but I was debited...", time: "2m ago", unread: 2, status: "online" },
  { id: 2, name: "Jane Smith", orderId: "#ORD-7722", lastMsg: "Where is my fish? It's been 1 hour.", time: "15m ago", unread: 0, status: "away" },
  { id: 3, name: "Robert Brown", orderId: "#ORD-7723", lastMsg: "Thank you, the food was great!", time: "1h ago", unread: 0, status: "offline" },
];

const messages = [
  { id: 1, sender: "customer", text: "Hello, I'm having trouble with my payment.", time: "12:45 PM", status: "seen" },
  { id: 2, sender: "admin", text: "Hi John! I'm sorry to hear that. Could you please provide your transaction ID?", time: "12:46 PM", status: "seen" },
  { id: 3, sender: "customer", text: "It's TXN-9903. The app said failed but my bank sent an alert.", time: "12:47 PM", status: "seen" },
  { id: 4, sender: "admin", text: "I'm checking that for you right now. Give me a moment.", time: "12:48 PM", status: "seen" },
];

const quickResponses = [
  "Your order is on the way",
  "We are sorry for the delay",
  "Payment has been confirmed",
  "Checking with the kitchen...",
  "Refund has been initiated",
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [inputText, setInputText] = useState("");
  const [showQuickResp, setShowQuickResp] = useState(false);

  return (
    <div className="h-[calc(100vh-140px)] -mt-2 flex overflow-hidden dashboard-card !p-0 border-none bg-transparent">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-border bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat..."
              className="w-full bg-gray-50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={cn(
                "w-full p-4 flex gap-3 transition-all border-b border-border/50 text-left hover:bg-gray-50",
                activeChat.id === chat.id && "bg-primary/[0.03] border-l-4 border-l-primary"
              )}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 border border-border">
                  {chat.name.charAt(0)}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full",
                  chat.status === "online" ? "bg-green-500" : 
                  chat.status === "away" ? "bg-orange-500" : "bg-gray-400"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 text-sm truncate">{chat.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate font-medium">{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-black">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-border bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
               {activeChat.name.charAt(0)}
             </div>
             <div>
                <h3 className="font-bold text-gray-900 leading-none">{activeChat.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">ORDER: {activeChat.orderId}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><Clock className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[70%]",
              msg.sender === "admin" ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "p-4 rounded-2xl text-sm font-medium shadow-sm transition-all",
                msg.sender === "admin" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white text-gray-800 border border-border rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1.5 mt-1 px-1">
                <span className="text-[10px] text-gray-400 font-bold">{msg.time}</span>
                {msg.sender === "admin" && (
                   <CheckCheck className={cn("w-3 h-3", msg.status === "seen" ? "text-blue-500" : "text-gray-300")} />
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold animate-pulse">
             <div className="flex gap-1">
               <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
               <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100" />
               <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200" />
             </div>
             Customer is typing...
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-border relative">
          <AnimatePresence>
            {showQuickResp && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 mb-2 bg-white border border-border rounded-xl shadow-xl p-2 w-64 z-50"
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest p-2 border-b border-border/50 mb-1">Quick Responses</div>
                {quickResponses.map((resp) => (
                  <button
                    key={resp}
                    onClick={() => {
                      setInputText(resp);
                      setShowQuickResp(false);
                    }}
                    className="w-full text-left p-2.5 text-xs font-semibold hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                  >
                    {resp}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-3 max-w-5xl mx-auto">
            <button 
              onClick={() => setShowQuickResp(!showQuickResp)}
              className={cn(
                "p-3 rounded-xl transition-all shadow-sm shrink-0",
                showQuickResp ? "bg-primary text-white shadow-primary/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <Zap className="w-5 h-5 font-black" />
            </button>
            <div className="flex-1 relative">
              <textarea
                rows={1}
                placeholder="Type your message here..."
                className="w-full bg-gray-100/50 border border-border rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none max-h-32 min-h-[48px]"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Smile className="w-5 h-5" /></button>
                <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
              </div>
            </div>
            <button className="p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 shrink-0">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Customer Details */}
      <div className="w-72 border-l border-border bg-white p-6 overflow-y-auto hidden xl:flex flex-col shrink-0 custom-scrollbar">
        <h3 className="font-bold text-gray-900 mb-6">Customer Details</h3>
        
        <div className="space-y-8">
           {/* Profile Header */}
           <div className="text-center">
             <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black mx-auto border border-primary/20 shadow-inner">
               {activeChat.name.charAt(0)}
             </div>
             <h4 className="mt-4 font-bold text-gray-900 text-lg">{activeChat.name}</h4>
             <p className="text-xs text-gray-500 font-medium">Customer since Jan 2026</p>
             <div className="mt-4 flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100">PLATINUM</span>
                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-200">VERIFIED</span>
             </div>
           </div>

           {/* Metrics */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-border/50">
                 <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-2">Total Spent</p>
                 <p className="text-sm font-black text-gray-900 tracking-tight">₦450.2k</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-border/50">
                 <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-2">Orders</p>
                 <p className="text-sm font-black text-gray-900 tracking-tight">24</p>
              </div>
           </div>

           {/* Recent Orders */}
           <div>
             <div className="flex items-center justify-between mb-4">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Orders</h5>
                <button className="text-primary text-[10px] font-bold hover:underline">See All</button>
             </div>
             <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-border/40 group hover:border-border transition-colors cursor-pointer">
                     <div className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                        <div>
                           <p className="text-xs font-bold text-gray-900 leading-none">Order #ORD-772{i}</p>
                           <p className="text-[10px] text-gray-500 mt-1 font-medium">Mar 12, 2026</p>
                        </div>
                     </div>
                     <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                  </div>
                ))}
             </div>
           </div>

           {/* Tags */}
           <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Tags</h5>
              <div className="flex flex-wrap gap-2">
                 {["Spicy Lover", "High Value", "Fast Delivery", "Fish Fan"].map((tag) => (
                   <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md hover:bg-primary/5 hover:text-primary transition-colors cursor-default">
                     {tag}
                   </span>
                 ))}
                 <button className="p-1 border border-dashed border-gray-300 rounded-md text-gray-400 hover:text-primary hover:border-primary transition-colors">
                    <Plus className="w-3 h-3" />
                 </button>
              </div>
           </div>

           {/* Action Buttons */}
           <div className="space-y-2 pt-4 border-t border-border">
              <button className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-all">View Full Profile</button>
              <button className="w-full py-3 border border-border text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all">Block Customer</button>
           </div>
        </div>
      </div>
    </div>
  );
}
