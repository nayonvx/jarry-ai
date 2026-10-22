"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Brush,
  Check,
  Code2,
  Copy,
  Globe,
  Newspaper,
  Palette,
  Send,
  ShieldCheck,
  Square,
  Trash2,
  Wand2,
} from "lucide-react";

interface Source {
  name: string;
  url: string;
  host_name: string;
  snippet: string;
  date: string;
}

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: number;
  sources?: Source[];
  images?: string[];
  imgPending?: boolean;
  error?: boolean;
}

const STORAGE_KEY = "jarry-chat-v1";

type FontKey = "default" | "round" | "serif" | "fancy";

interface Theme {
  name: string;
  bg: string;
  accent1: string;
  accent2: string;
  font: FontKey;
  radius: number;
}

const DEFAULT_THEME: Theme = {
  name: "Rose Night",
  bg: "#0d0a14",
  accent1: "#f43f5e",
  accent2: "#d946ef",
  font: "default",
  radius: 16,
};
const THEME_KEY = "jarry-theme-v1";
const AVATAR_KEY = "jarry-avatar-v1";
const DEFAULT_AVATAR = "/jarry-avatar.png";

const FONT_KEYS: FontKey[] = ["default", "round", "serif", "fancy"];

const FONT_BODY: Record<FontKey, string> = {
  default: '"Hind Siliguri", ui-sans-serif, system-ui, sans-serif',
  round: '"Baloo Da 2", "Hind Siliguri", ui-sans-serif, system-ui, sans-serif',
  serif: '"Noto Serif Bengali", "Hind Siliguri", serif',
  fancy: '"Galada", "Hind Siliguri", cursive',
};

const FONT_DISPLAY: Record<FontKey, string> = {
  default: '"Baloo Da 2", "Hind Siliguri", ui-sans-serif, system-ui, sans-serif',
  round: '"Baloo Da 2", "Hind Siliguri", ui-sans-serif, system-ui, sans-serif',
  serif: '"Noto Serif Bengali", "Hind Siliguri", serif',
  fancy: '"Galada", "Hind Siliguri", cursive',
};

/* ---------- Color utilities ---------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function mixHex(hex: string, other: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(other);
  const m = (x: number, y: number) => Math.round(x * (1 - ratio) + y * ratio);
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(m(r1, r2))}${to(m(g1, g2))}${to(m(b1, b2))}`;
}

function clampHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  let s = value.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(s)) s = s.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/.test(s)) return fallback;
  return `#${s}`;
}

function clampRadius(v: unknown, fallback: number): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return Math.round(Math.min(28, Math.max(8, n)));
}

function sanitizeTheme(raw: unknown, prev?: Theme): Theme {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const base = prev ?? DEFAULT_THEME;
  const name =
    typeof obj.name === "string" && obj.name.trim()
      ? obj.name.trim().slice(0, 40)
      : base.name;
  const font =
    typeof obj.font === "string" && FONT_KEYS.includes(obj.font as FontKey)
      ? (obj.font as FontKey)
      : base.font;
  return {
    name,
    bg: obj.bg !== undefined ? clampHex(obj.bg, base.bg) : base.bg,
    accent1:
      obj.accent1 !== undefined ? clampHex(obj.accent1, base.accent1) : base.accent1,
    accent2:
      obj.accent2 !== undefined ? clampHex(obj.accent2, base.accent2) : base.accent2,
    font,
    radius: obj.radius !== undefined ? clampRadius(obj.radius, base.radius) : base.radius,
  };
}

function buildCssVars(t: Theme): Record<string, string> {
  let bg = t.bg;
  const [r, g, b] = hexToRgb(bg);
  // Keep the background dark enough for white text to stay readable
  if (0.2126 * r + 0.7152 * g + 0.0722 * b > 96) bg = mixHex(bg, "#000000", 0.55);
  const { accent1: a1, accent2: a2 } = t;
  return {
    "--jt-bg": bg,
    "--jt-bar": rgba(bg, 0.8),
    "--jt-code": mixHex(bg, "#ffffff", 0.05),
    "--jt-accent1": a1,
    "--jt-accent2": a2,
    "--jt-accent1-a14": rgba(a1, 0.14),
    "--jt-accent1-a25": rgba(a1, 0.25),
    "--jt-accent2-a25": rgba(a2, 0.25),
    "--jt-accent1-a40": rgba(a1, 0.45),
    "--jt-accent1-tint": mixHex(a1, "#ffffff", 0.5),
    "--jt-accent2-tint": mixHex(a2, "#ffffff", 0.45),
    "--jt-glow-a": rgba(a1, 0.35),
    "--jt-glow-b": rgba(a2, 0.5),
    "--jt-glow1": rgba(a1, 0.09),
    "--jt-glow2": rgba(a2, 0.08),
    "--jt-glow3": rgba(a2, 0.06),
    "--jt-font": FONT_BODY[t.font] ?? FONT_BODY.default,
    "--jt-font-display": FONT_DISPLAY[t.font] ?? FONT_DISPLAY.default,
    "--jt-radius": `${t.radius}px`,
  };
}

const SUGGESTIONS = [
  {
    icon: Code2,
    label: "কোডিং শেখাও 💻",
    prompt:
      "জ্যারি, আমি প্রোগ্রামিং শেখা শুরু করতে চাই। কোন ভাষা দিয়ে শুরু করব আর কীভাবে? একটা সহজ রোডম্যাপ দাও।",
    search: false,
  },
  {
    icon: ShieldCheck,
    label: "এথিক্যাল হ্যাকিং 🔐",
    prompt:
      "এথিক্যাল হ্যাকিং কীভাবে শিখব? শুরু করার জন্য কী কী টুল, ল্যাব আর রোডম্যাপ দরকার বলো।",
    search: false,
  },
  {
    icon: Newspaper,
    label: "আজকের টেক নিউজ 📰",
    prompt: "আজকের সবচেয়ে বড় টেকনোলজি নিউজগুলো কী কী?",
    search: true,
  },
  {
    icon: Palette,
    label: "থিম বদলাও 🎨",
    prompt:
      "জ্যারি, তোমার থিম বদলে দাও! মনের মতো একটা সুন্দর নতুন রঙের থিম বানাও 😍",
    search: false,
  },
  {
    icon: Brush,
    label: "ছবি আঁকো 🖌️",
    prompt:
      "জ্যারি, আমার জন্য একটা সুন্দর ছবি আঁকো — সূর্যাস্তের সময় নদীর ধারে নৌকা 🌅",
    search: false,
  },
  {
    icon: Wand2,
    label: "নতুন লুক 🧚",
    prompt:
      "জ্যারি, তোমার থিম, ফন্ট আর অবতার সব নিজে বদলে ফেলো — একদম নতুন নিজেকে বানাও!",
    search: false,
  },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function fmtTime(t: number) {
  try {
    return new Date(t).toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="jt-code my-2 overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-1.5">
        <span className="jt-lang font-mono text-[11px] uppercase tracking-wider">
          {lang || "code"}
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="কোড কপি করো"
          type="button"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "কপি হয়েছে" : "কপি"}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || "text"}
        style={oneDark}
        wrapLongLines
        customStyle={{
          margin: 0,
          background: "transparent",
          fontSize: "12.5px",
          padding: "12px 14px",
        }}
        codeTagProps={{
          style: {
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const mdComponents: Components = {
  pre({ children }) {
    const el = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    const cls = el?.props?.className || "";
    const lang = /language-(\w+)/.exec(cls)?.[1] || "";
    const raw = String(el?.props?.children ?? "").replace(/\n$/, "");
    return <CodeBlock code={raw} lang={lang} />;
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

function MessageBubble({
  msg,
  streaming,
  avatarUrl,
}: {
  msg: Msg;
  streaming?: boolean;
  avatarUrl?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (isUser) {
    return (
      <div className="jarry-fade-up flex justify-end">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="jt-accent-bg jarry-bubble-user px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-lg shadow-black/40">
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
          <p className="mt-1 text-right text-[10px] text-white/35">
            {fmtTime(msg.time)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="jarry-fade-up flex gap-2.5">
      <Image
        src={avatarUrl || DEFAULT_AVATAR}
        alt="Jarry AI"
        width={32}
        height={32}
        unoptimized
        className="jt-ring mt-1 h-8 w-8 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 max-w-[88%] sm:max-w-[80%]">
        <div
          className={`jarry-glass jarry-bubble-ai px-4 py-3 ${
            msg.error ? "jt-error-border" : ""
          }`}
        >
          {msg.content ? (
            <div className="jarry-md text-[15px] text-white/90">
              <Markdown components={mdComponents}>{msg.content}</Markdown>
              {streaming && <span className="jarry-caret" />}
            </div>
          ) : streaming ? (
            <div className="flex items-center gap-1 py-1.5" aria-label="জ্যারি লিখছে">
              <span className="jarry-dot jt-dot-1 h-2 w-2 rounded-full" />
              <span className="jarry-dot jt-dot-2 h-2 w-2 rounded-full" />
              <span className="jarry-dot jt-dot-3 h-2 w-2 rounded-full" />
            </div>
          ) : null}

          {msg.imgPending && (
            <div className="jarry-shimmer mt-2 flex h-44 items-center justify-center rounded-xl border border-white/10 text-sm text-white/50">
              🖌️ ছবি আঁকছি, একটু অপেক্ষা...
            </div>
          )}
          {msg.images && msg.images.length > 0 && (
            <div className="mt-2 grid gap-2">
              {msg.images.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="বড় করে দেখো"
                >
                  <Image
                    src={url}
                    alt="জ্যারির আঁকা ছবি"
                    width={1024}
                    height={1024}
                    unoptimized
                    className="jarry-img h-auto w-full"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {msg.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                className="jt-hover-accent inline-flex max-w-[220px] items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70"
              >
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{s.host_name || s.name}</span>
              </a>
            ))}
          </div>
        )}

        {!streaming && msg.content && (
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={onCopy}
              type="button"
              className="jt-hover-text text-[10px] text-white/30"
            >
              {copied ? "কপি হয়েছে ✓" : "কপি করো"}
            </button>
            <span className="text-[10px] text-white/25">{fmtTime(msg.time)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [themeNotice, setThemeNotice] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyCssVars = useCallback((t: Theme) => {
    const root = document.documentElement;
    const vars = buildCssVars(t);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  }, []);

  // Load saved theme (and apply default immediately to avoid flash)
  useEffect(() => {
    let t = DEFAULT_THEME;
    try {
      const raw = localStorage.getItem(THEME_KEY);
      if (raw) t = sanitizeTheme(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setTheme(t);
    applyCssVars(t);
    try {
      const a = localStorage.getItem(AVATAR_KEY);
      if (a && a.startsWith("/generated/")) setAvatarUrl(a);
    } catch {
      /* ignore */
    }
  }, [applyCssVars]);

  // Re-apply + persist on theme change
  useEffect(() => {
    applyCssVars(theme);
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    } catch {
      /* storage unavailable */
    }
  }, [theme, applyCssVars]);

  const showThemeNotice = useCallback((text: string) => {
    setThemeNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setThemeNotice(null), 4500);
  }, []);

  const handleThemeEvent = useCallback(
    (raw: unknown) => {
      setTheme((prev) => sanitizeTheme(raw, prev));
      const name =
        raw && typeof raw === "object" && typeof (raw as { name?: unknown }).name === "string"
          ? ((raw as { name: string }).name as string).slice(0, 40)
          : "নতুন থিম";
      showThemeNotice(`🎨 নতুন থিম: ${name}`);
    },
    [showThemeNotice]
  );

  const handleAvatarEvent = useCallback(
    (url: unknown) => {
      if (typeof url !== "string" || !url.startsWith("/generated/")) return;
      setAvatarUrl(url);
      try {
        localStorage.setItem(AVATAR_KEY, url);
      } catch {
        /* storage unavailable */
      }
      showThemeNotice("🧚 আমার নতুন অবতার তৈরি! কেমন লাগছে? 😍");
    },
    [showThemeNotice]
  );

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    setAvatarUrl(null);
    try {
      localStorage.removeItem(AVATAR_KEY);
    } catch {
      /* ignore */
    }
    showThemeNotice("🎨 ডিজাইন রিসেট — Rose Night");
  };

  // Load saved history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist history
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* storage full/unavailable */
    }
  }, [messages, hydrated]);

  const scrollToBottom = useCallback((force = false) => {
    const el = scrollRef.current;
    if (!el) return;
    if (force || pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const autoResize = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 150)}px`;
  };

  const send = useCallback(
    async (text?: string, opts?: { search?: boolean }) => {
      const content = (text ?? input).trim();
      if (!content || busy) return;
      const useSearch = opts?.search ?? webSearch;
      if (opts?.search) setWebSearch(true);

      const userMsg: Msg = { id: uid(), role: "user", content, time: Date.now() };
      const aiId = uid();
      const aiMsg: Msg = { id: aiId, role: "assistant", content: "", time: Date.now() };
      const history = [...messages, userMsg];

      setMessages([...history, aiMsg]);
      setInput("");
      setBusy(true);
      pinnedRef.current = true;
      if (taRef.current) taRef.current.style.height = "auto";

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            webSearch: useSearch,
            theme,
          }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "সংযোগে সমস্যা হয়েছে!");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            try {
              const evt = JSON.parse(line.slice(5).trim());
              if (evt.type === "delta") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId ? { ...m, content: m.content + evt.text } : m
                  )
                );
              } else if (evt.type === "sources") {
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiId ? { ...m, sources: evt.sources } : m))
                );
              } else if (evt.type === "theme") {
                handleThemeEvent(evt.theme);
              } else if (evt.type === "image_pending") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId ? { ...m, imgPending: true } : m
                  )
                );
              } else if (evt.type === "image") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId
                      ? {
                          ...m,
                          imgPending: false,
                          images: [...(m.images || []), evt.url],
                        }
                      : m
                  )
                );
              } else if (evt.type === "image_error") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId ? { ...m, imgPending: false } : m
                  )
                );
                showThemeNotice("😔 ছবি আঁকা গেল না, আবার চেষ্টা করো!");
              } else if (evt.type === "avatar_pending") {
                showThemeNotice("🧚 নতুন অবতার আঁকছি, একটু অপেক্ষা...");
              } else if (evt.type === "avatar") {
                handleAvatarEvent(evt.url);
              } else if (evt.type === "avatar_error") {
                showThemeNotice("😔 অবতার আঁকা গেল না, আবার চেষ্টা করো!");
              } else if (evt.type === "error") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId
                      ? { ...m, content: m.content || evt.message, error: !m.content }
                      : m
                  )
                );
              } else if (evt.type === "done") {
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiId ? { ...m, time: m.time || Date.now() } : m))
                );
              }
            } catch {
              /* skip malformed event */
            }
          }
        }
      } catch (err: unknown) {
        const e = err as Error;
        if (e?.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? { ...m, content: m.content || "পাঠানো থামিয়ে দিয়েছি 😊" }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    content: m.content || e?.message || "কিছু একটা সমস্যা হয়েছে!",
                    error: !m.content,
                  }
                : m
            )
          );
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [input, busy, messages, webSearch, theme, handleThemeEvent, handleAvatarEvent, showThemeNotice]
  );

  const stop = () => abortRef.current?.abort();

  const clearChat = () => {
    if (busy) abortRef.current?.abort();
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="jarry-bg flex h-screen flex-col text-white">
      {/* Header */}
      <header className="jt-bar z-20 border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="jarry-avatar-glow shrink-0 rounded-full">
              <Image
                src={avatarUrl || DEFAULT_AVATAR}
                alt="Jarry AI avatar"
                width={42}
                height={42}
                priority
                unoptimized
                className="jt-ring h-[42px] w-[42px] rounded-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bangla-display text-xl font-bold leading-tight">
                <span className="jarry-gradient-text">Jarry</span>
              </h1>
              <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="truncate">সুপার AI • অনলাইন 🌸</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setWebSearch((v) => !v)}
              type="button"
              aria-pressed={webSearch}
              title="অনলাইন সার্চ চালু/বন্ধ করো"
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
                webSearch
                  ? "jt-accent-bg text-white shadow-md shadow-black/30"
                  : "jarry-glass text-white/70 hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">অনলাইন সার্চ</span>
              <span className="sm:hidden">সার্চ</span>
            </button>
            <button
              onClick={resetTheme}
              type="button"
              title="ডিজাইন রিসেট করো"
              aria-label="ডিজাইন রিসেট করো"
              className="jarry-glass jt-hover-accent flex h-9 w-9 items-center justify-center rounded-full text-white/60"
            >
              <Palette className="h-4 w-4" />
            </button>
            <button
              onClick={clearChat}
              type="button"
              title="চ্যাট মুছে ফেলো"
              aria-label="চ্যাট মুছে ফেলো"
              className="jarry-glass jt-hover-accent flex h-9 w-9 items-center justify-center rounded-full text-white/60"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Theme change notice */}
      {themeNotice && (
        <div className="pointer-events-none fixed left-1/2 top-[72px] z-30 -translate-x-1/2">
          <div className="jarry-glass jt-notice jarry-fade-up rounded-full px-4 py-1.5 text-xs font-semibold shadow-lg shadow-black/30">
            {themeNotice}
          </div>
        </div>
      )}

      {/* Chat area */}
      <main
        ref={scrollRef}
        onScroll={onScroll}
        className="jarry-scroll flex-1 overflow-y-auto px-3 py-4 sm:px-4"
        aria-live="polite"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {isEmpty ? (
            <div className="jarry-fade-up flex flex-col items-center pt-8 text-center sm:pt-12">
              <div className="jarry-avatar-glow rounded-full">
                <Image
                  src={avatarUrl || DEFAULT_AVATAR}
                  alt="Jarry AI"
                  width={112}
                  height={112}
                  priority
                  unoptimized
                  className="jt-ring h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                />
              </div>
              <h2 className="font-bangla-display mt-5 text-2xl font-extrabold sm:text-3xl">
                হ্যালো! আমি <span className="jarry-gradient-text">জ্যারি</span> 🌸
              </h2>
              <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-white/60">
                তোমার সুপার স্মার্ট বাংলা AI বন্ধু! কোডিং 💻, অ্যাপ/APK 📱, হ্যাকিং 🔐,
                ছবি আঁকা 🖌️, নিজের ডিজাইন বদলানো 🎨, অনলাইন তথ্য 🌐 — যা চাও বলো,
                বাংলাতেই কথা হবে 😊
              </p>

              <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.prompt, { search: s.search })}
                    type="button"
                    className="jarry-glass jt-radius group flex items-center gap-3 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <span className="jt-icon-chip flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-110">
                      <s.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white/90">
                        {s.label}
                      </span>
                      <span className="block text-[11px] text-white/45">
                        {s.search ? "অনলাইন সার্চ লাগবে 🌐" : "জ্যারির কাছে জিজ্ঞেস করো"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                msg={m}
                streaming={busy && m.role === "assistant" && i === messages.length - 1}
                avatarUrl={avatarUrl}
              />
            ))
          )}
        </div>
      </main>

      {/* Input area */}
      <footer className="jt-bar border-t border-white/10 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-3 py-3 sm:px-4">
          <div className="jarry-glass jt-radius jt-focus-within flex items-end gap-2 p-2 transition">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="জ্যারিকে কিছু লিখো... (বাংলা / বাংলিশ / English)"
              aria-label="মেসেজ লিখো"
              className="jarry-scroll max-h-[150px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-white placeholder:text-white/35 focus:outline-none"
            />
            {busy ? (
              <button
                onClick={stop}
                type="button"
                aria-label="থামাও"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                type="button"
                aria-label="পাঠাও"
                className="jt-accent-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-black/30 transition hover:opacity-90 disabled:opacity-30 disabled:shadow-none"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-white/30">
            জ্যারি AI দ্বারা 💕 — মাঝে মাঝে ভুল হতে পারে, গুরুত্বপূর্ণ তথ্য যাচাই করে নিও ·
            Enter = পাঠাও · Shift+Enter = নতুন লাইন
          </p>
        </div>
      </footer>
    </div>
  );
}
