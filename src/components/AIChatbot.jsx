import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareCode, X, Send, Bot, User, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I am the QuickWorker AI Assistant. How can I help you today? You can ask about our 30 services in Hassan, pricing, how to book, or contact details."
    }
  ]);
  const { askAI, refreshLocation } = useApp();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    if (!textToSend) setInput("");

    // Simulate thinking state
    setTimeout(() => {
      const response = askAI(text);
      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: response.text,
        action: response.action 
      }]);
    }, 600);
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.startsWith("/")) {
      navigate(action);
      setIsOpen(false);
    } else if (action === "location_refresh") {
      refreshLocation();
    } else if (action === "whatsapp_support") {
      window.open("https://wa.me/919876543210?text=Hi%20QuickWorker%20Support,%20I%20need%20assistance.", "_blank");
    }
  };

  const chips = [
    "Find an Electrician",
    "How to book a service?",
    "Localities in Hassan",
    "Contact Support"
  ];

  return (
    <div className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-40">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-4.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center cursor-pointer border border-blue-500/20"
          title="Open AI Chat Assistant"
        >
          <MessageSquareCode className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Dialog Drawer */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-[330px] sm:w-[360px] h-[480px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-650 p-4.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm leading-tight">QuickWorker AI</h4>
                <span className="text-[10px] text-blue-200 font-medium">Assistant is Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"} text-left`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  m.sender === "user" ? "bg-slate-700" : "bg-blue-600 dark:bg-blue-500"
                }`}>
                  {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-[75%]">
                  <div className={`p-3 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed whitespace-pre-line ${
                    m.sender === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 text-slate-855 dark:text-slate-200 rounded-tl-none"
                  }`}>
                    {m.text}
                  </div>
                  
                  {/* Action Link inside bot bubble */}
                  {m.sender === "bot" && m.action && (
                    <button
                      onClick={() => handleActionClick(m.action)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-150/40 dark:border-blue-900/60 transition-all cursor-pointer"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply chips */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Send Input panel */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-750 flex items-center justify-center cursor-pointer shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
