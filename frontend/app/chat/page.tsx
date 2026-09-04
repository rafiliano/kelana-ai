"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { isLoggedIn } from "@/services/authService";
import {
  createConversation,
  listConversations,
  getMessages,
  sendMessage,
  updateConversationTitle,
} from "@/services/chatService";
import ReactMarkdown from "react-markdown";

// Always show date + time: "Aug 26, 14:32"
function formatLastSeen(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

interface Message {
  id?        : number;
  role       : "user" | "assistant";
  content    : string;
  created_at?: string;
}

interface Conversation {
  id              : number;
  title           : string;
  created_at      : string;
  last_message_at : string;
}

export default function ChatPage() {
  const [conversations, setConversations]       = useState<Conversation[]>([]);
  const [activeId, setActiveId]                 = useState<number | null>(null);
  const [messages, setMessages]                 = useState<Message[]>([]);
  const [input, setInput]                       = useState("");
  const [sending, setSending]                   = useState(false);
  const [loadingHistory, setLoadingHistory]     = useState(false);
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [editingId, setEditingId]               = useState<number | null>(null);
  const [editingTitle, setEditingTitle]         = useState("");
  const bottomRef                               = useRef<HTMLDivElement>(null);
  const clickTimerRef                           = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMessageRef                       = useRef<boolean>(false);
  const router                                  = useRouter();

  // Auth guard + load conversations
  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    listConversations().then(setConversations).catch(console.error);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when switching conversation
  const selectConversation = async (id: number) => {
    setActiveId(id);
    setLoadingHistory(true);
    setMessages([]);
    isFirstMessageRef.current = false;
    try {
      const history = await getMessages(id);
      setMessages(history);
      // Mark as first message only if no history exists
      isFirstMessageRef.current = history.length === 0;
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Start a new conversation
  const handleNew = async () => {
    try {
      const id = await createConversation("New Chat");
      const updated = await listConversations();
      setConversations(updated);
      await selectConversation(id);
      isFirstMessageRef.current = true;
    } catch (e) {
      console.error(e);
    }
  };

  // Rename a conversation (manual)
  const handleRename = async (id: number) => {
    if (!editingTitle.trim()) { setEditingId(null); return; }
    try {
      await updateConversationTitle(id, editingTitle.trim());
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editingTitle.trim() } : c));
    } catch (e) { console.error(e); }
    setEditingId(null);
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !activeId || sending) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);

    // Optimistic thinking indicator
    const thinkingMsg: Message = { role: "assistant", content: "..." };
    setMessages(prev => [...prev, thinkingMsg]);

    try {
      const result = await sendMessage(activeId, userMsg.content);
      // Replace thinking with real reply
      setMessages(prev => [
        ...prev.slice(0, -1),
        result.assistant_message ?? { role: "assistant", content: "No response." },
      ]);

      // Auto-title: if this was the first message, use first 40 chars of user input
      if (isFirstMessageRef.current) {
        isFirstMessageRef.current = false;
        const autoTitle = userMsg.content.slice(0, 40) + (userMsg.content.length > 40 ? "..." : "");
        try {
          await updateConversationTitle(activeId, autoTitle);
          setConversations(prev => prev.map(c => c.id === activeId ? { ...c, title: autoTitle } : c));
        } catch (e) { /* non-critical */ }
      }

      // Bump this conversation to the top with updated last_message_at
      const now = new Date().toISOString();
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === activeId ? { ...c, last_message_at: now } : c
        );
        // Sort: most recently active first
        return [...updated].sort((a, b) =>
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );
      });
    } catch (e) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>

        {/* Sidebar — conversation list */}
        <aside className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-200 bg-white border-r border-blue-100 flex flex-col overflow-hidden flex-shrink-0`}>
          <div className="p-4 border-b border-blue-50">
            <button
              onClick   = {handleNew}
              className = "w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              + New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {conversations.length === 0 ? (
              <p className="text-slate-400 text-xs text-center mt-6">No conversations yet</p>
            ) : (
              conversations.map(c => (
                <div key={c.id} className="relative group">
                  {editingId === c.id ? (
                    // Inline rename input
                    <input
                      autoFocus
                      value     = {editingTitle}
                      onChange  = {(e) => setEditingTitle(e.target.value)}
                      onBlur    = {() => handleRename(c.id)}
                      onKeyDown = {(e) => {
                        if (e.key === "Enter") handleRename(c.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className = "w-full px-3 py-2 rounded-xl text-sm bg-blue-50 border border-blue-300 outline-none text-slate-800"
                    />
                  ) : (
                    <button
                      onClick       = {(e) => {
                        // Use timer to distinguish single vs double click
                        // Double click cancels the single click so no scroll happens
                        if (clickTimerRef.current) return;
                        clickTimerRef.current = setTimeout(() => {
                          clickTimerRef.current = null;
                          selectConversation(c.id);
                        }, 200);
                      }}
                      onDoubleClick = {() => {
                        // Cancel the single click timer
                        if (clickTimerRef.current) {
                          clearTimeout(clickTimerRef.current);
                          clickTimerRef.current = null;
                        }
                        setEditingId(c.id);
                        setEditingTitle(c.title);
                      }}
                      className     = {`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${
                        activeId === c.id
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-slate-600 hover:bg-blue-50"
                      }`}
                    >
                      <p className="truncate font-medium">{c.title}</p>
                      <p className={`text-xs mt-0.5 ${activeId === c.id ? "text-blue-200" : "text-slate-400"}`}>
                        {formatLastSeen(c.last_message_at)}
                      </p>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <div className="bg-white border-b border-blue-100 px-4 py-3 flex items-center gap-3">
            <button
              onClick   = {() => setSidebarOpen(o => !o)}
              className = "text-slate-400 hover:text-blue-600 transition text-lg"
            >
              ☰
            </button>
            <p className="text-slate-700 font-semibold text-sm">
              {activeId
                ? conversations.find(c => c.id === activeId)?.title ?? "Chat"
                : "Select or start a conversation"}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            {!activeId && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center mt-20">
                <p className="text-green-500 text-4xl">✦</p>
                <p className="text-slate-700 font-semibold text-lg">KelanaAI Chat</p>
                <p className="text-slate-400 text-sm max-w-sm">
                  Start a new conversation or select one from the sidebar to chat with your AI travel assistant.
                </p>
                <button
                  onClick   = {handleNew}
                  className = "bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-blue-700 transition"
                >
                  + New Chat
                </button>
              </div>
            )}

            {loadingHistory && (
              <p className="text-blue-400 text-sm text-center animate-pulse">Loading history...</p>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border border-blue-100 text-slate-700 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.content === "..." ? (
                    <div className="flex gap-1 items-center h-5">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  ) : msg.role === "user" ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-p:text-slate-700 prose-li:text-slate-600 prose-strong:text-slate-800 prose-headings:text-blue-600">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="bg-white border-t border-blue-100 p-4">
            <div className={`flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-2.5 ${!activeId ? "opacity-50 pointer-events-none" : ""}`}>
              <input
                value       = {input}
                onChange    = {(e) => setInput(e.target.value)}
                onKeyDown   = {(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder = {activeId ? "Ask anything about travel..." : "Start a conversation first"}
                disabled    = {!activeId || sending}
                className   = "flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
              />
              <button
                onClick   = {handleSend}
                disabled  = {!input.trim() || !activeId || sending}
                className = "bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
            <p className="text-slate-300 text-xs text-center mt-2">Press Enter to send</p>
          </div>

        </div>
      </div>
    </div>
  );
}
