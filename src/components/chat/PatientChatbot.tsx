"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Send, Sparkles, Trash2, X } from "lucide-react";
import { askSchedulaAssistant } from "@/app/actions/chat";
import { getCurrentUser, type StoredUser } from "@/lib/client-storage";
import type { ChatMessage, ChatTurn } from "@/types/chat";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I can help you explore Schedula doctors, choose a specialty, understand appointments, or answer general health questions. How can I help?",
};

function storageKey(userId: string) {
  return `schedula-care-chat:${userId}`;
}

function newMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, content };
}

export default function PatientChatbot() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const reduceMotion = useReducedMotion();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPatient = () => {
      const current = getCurrentUser();
      setUser(current);
      setOpen(false);

      if (current?.role !== "patient") {
        setMessages([WELCOME]);
        return;
      }

      try {
        const saved = localStorage.getItem(storageKey(current.id));
        if (saved) {
          const parsed = JSON.parse(saved) as ChatMessage[];
          setMessages(Array.isArray(parsed) && parsed.length ? parsed.slice(-30) : [WELCOME]);
        } else {
          setMessages([WELCOME]);
        }
      } catch {
        localStorage.removeItem(storageKey(current.id));
        setMessages([WELCOME]);
      }
    };

    syncPatient();
    window.addEventListener("schedula-auth-change", syncPatient);
    window.addEventListener("storage", syncPatient);
    return () => {
      window.removeEventListener("schedula-auth-change", syncPatient);
      window.removeEventListener("storage", syncPatient);
    };
  }, []);

  useEffect(() => {
    if (user?.role === "patient") localStorage.setItem(storageKey(user.id), JSON.stringify(messages.slice(-30)));
    if (open) endRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, open, reduceMotion, user]);

  if (user?.role !== "patient") return null;

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    const history: ChatTurn[] = messages
      .filter((item) => item.id !== "welcome")
      .map(({ role, content }) => ({ role, content }));
    const outgoing = newMessage("user", question);
    setMessages((current) => [...current, outgoing]);
    setInput("");
    setSending(true);

    const result = await askSchedulaAssistant(history, question);
    setMessages((current) => [
      ...current,
      newMessage("assistant", result.ok ? result.answer : result.error),
    ]);
    setSending(false);
  };

  const clearHistory = () => {
    setMessages([WELCOME]);
    localStorage.removeItem(storageKey(user.id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Schedula care assistant"
            className="absolute bottom-[4.75rem] right-0 flex h-[min(38rem,calc(100vh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_28px_90px_rgba(11,19,41,0.24)]"
          >
            <header className="flex items-center justify-between gap-4 bg-[#0B1329] px-4 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="relative grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[#0B1329]"><Bot size={21} /><i className="absolute right-1 top-1 size-1.5 rounded-full bg-[#2E9B57] ring-2 ring-[#dbeafe]" /></span>
                <div><p className="text-sm font-bold">Schedula Care AI</p><p className="mt-0.5 text-[10px] text-white/55">Doctors &bull; appointments &bull; general health</p></div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={clearHistory} aria-label="Clear chat history" className="grid size-8 place-items-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"><Trash2 size={15} /></button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-8 place-items-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"><X size={17} /></button>
              </div>
            </header>

            <div className="warm-scrollbar flex-1 space-y-4 overflow-y-auto bg-[#F8FAFC] px-4 py-5" aria-live="polite">
              {messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: reduceMotion ? 0 : 7 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[#2563eb] text-white" : "rounded-bl-md border border-[#E2E8F0] bg-white text-[#334155] shadow-sm"}`}>{message.content}</div>
                </motion.div>
              ))}
              {sending && <div className="flex justify-start"><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#E2E8F0] bg-white px-4 py-3"><i className="size-1.5 animate-bounce rounded-full bg-[#2563eb]" /><i className="size-1.5 animate-bounce rounded-full bg-[#D96B32] [animation-delay:120ms]" /><i className="size-1.5 animate-bounce rounded-full bg-[#64748B] [animation-delay:240ms]" /></div></div>}
              <div ref={endRef} />
            </div>

            <form onSubmit={sendMessage} className="border-t border-[#E2E8F0] bg-white p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#dbeafe]/60">
                <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={1200} placeholder="Ask about doctors or your health..." className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#64748B]" />
                <button type="submit" disabled={!input.trim() || sending} aria-label="Send message" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#2563eb] text-white hover:bg-[#C9362D] disabled:cursor-not-allowed disabled:opacity-45"><Send size={17} /></button>
              </div>
              <p className="mt-2 text-center text-[9px] leading-4 text-[#64748B]">General guidance only. Not a diagnosis or emergency service.</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        whileHover={reduceMotion ? undefined : { y: -4, rotate: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        aria-label={open ? "Close Schedula care assistant" : "Open Schedula care assistant"}
        className="group relative grid size-16 place-items-center rounded-[22px] bg-[#0B1329] text-white shadow-[0_18px_45px_rgba(11,19,41,0.3)]"
      >
        {!open && <motion.span animate={reduceMotion ? undefined : { scale: [1, 1.45, 1], opacity: [0.45, 0, 0.45] }} transition={{ duration: 2.2, repeat: Infinity }} className="absolute inset-0 rounded-[22px] border border-[#2563eb]" />}
        <span className="absolute -top-1.5 left-1/2 h-2.5 w-px -translate-x-1/2 bg-[#dbeafe]" />
        <span className="absolute -top-2.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[#2563eb]" />
        {open ? <X size={24} /> : <Bot size={27} className="transition-transform group-hover:scale-110" />}
        {!open && <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-[#2563eb] text-white ring-2 ring-[#F8FAFC]"><Sparkles size={12} /></span>}
      </motion.button>
    </div>
  );
}
