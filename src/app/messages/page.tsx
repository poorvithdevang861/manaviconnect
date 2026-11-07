"use client";

import { useState } from "react";
import { Search, Send, ShieldCheck } from "lucide-react";
import { MOCK_THREADS, CURRENT_USER, MessageThread } from "@/lib/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
import { HouseBadge } from "@/components/ui/Badge";

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>(MOCK_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(MOCK_THREADS[0].id);
  const [newMessageText, setNewMessageText] = useState("");
  const [search, setSearch] = useState("");

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeThread) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: CURRENT_USER.id,
      text: newMessageText.trim(),
      timestamp: "Just now",
      isSelf: true,
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThread.id) return t;
        return {
          ...t,
          lastMessage: newMsg.text,
          lastMessageAt: "Just now",
          messages: [...t.messages, newMsg],
        };
      })
    );

    setNewMessageText("");
  };

  const filteredThreads = threads.filter((t) =>
    t.participant.name.toLowerCase().includes(search.toLowerCase()) ||
    t.participant.batch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Standardized Page Header */}
      <PageHeader
        tag="Messages"
        meta="1-on-1 Alumni Connect"
        title="Alumni Messages"
        description="Private, verified direct messaging with fellow Navodaya alumni."
      />

      {/* Main Messaging Container */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[calc(100vh-230px)]">
        
        {/* Left: Thread List (4 cols) */}
        <div className="md:col-span-4 border-r border-zinc-200/80 flex flex-col bg-zinc-50/40">
          
          {/* Thread Search */}
          <div className="p-3.5 border-b border-zinc-100 bg-white">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:bg-white focus:border-orange-500 text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Threads */}
          <div className="divide-y divide-zinc-100 overflow-y-auto flex-1">
            {filteredThreads.map((thread) => {
              const isSelected = thread.id === activeThread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full text-left p-3.5 sm:p-4 flex items-start gap-3 transition-colors ${
                    isSelected ? "bg-orange-50/70 border-l-2 border-orange-600 font-medium" : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                    {thread.participant.name[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-900 truncate">
                        {thread.participant.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-1">
                        {thread.lastMessageAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {thread.participant.house && (
                        <HouseBadge house={thread.participant.house} size="sm" />
                      )}
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {thread.participant.batch}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 truncate mt-1">
                      {thread.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right: Active Conversation (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          
          {/* Active Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-mono text-xs font-semibold">
                {activeThread.participant.name[0]}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  {activeThread.participant.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {activeThread.participant.house && (
                    <HouseBadge house={activeThread.participant.house} size="sm" />
                  )}
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {activeThread.participant.batch} • {activeThread.participant.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-mono">
              <ShieldCheck size={14} className="text-orange-600" />
              <span>Verified Alumni Chat</span>
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-3 bg-[#fafafa]">
            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-md lg:max-w-lg px-4 py-2.5 rounded-xl text-xs leading-relaxed ${
                    msg.isSelf
                      ? "bg-orange-600 text-white rounded-br-none shadow-xs"
                      : "bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-none shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3.5 border-t border-zinc-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder={`Message ${activeThread.participant.name}...`}
              className="flex-1 px-3.5 py-2 text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg outline-none focus:bg-white focus:border-orange-500 text-zinc-900 placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="btn-press px-4 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Send size={13} />
              Send
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
