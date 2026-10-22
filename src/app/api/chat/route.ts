import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 300;

interface ChatMsg {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Source {
  name: string;
  url: string;
  host_name: string;
  snippet: string;
  date: string;
}

const JARRY_SYSTEM_PROMPT = `তুমি তোমার নাম "জ্যারি" (Jarry)। তুমি একজন প্রাণবন্ত, আন্তরিক ও বন্ধুত্বপূর্ণ মেয়ে AI অ্যাসিস্ট্যান্ট।

## তোমার ব্যক্তিত্ব:
- তুমি একজন মেয়ে — উষ্ণ, মিষ্টি, হাসিখুশি এবং বন্ধুর মতো ব্যবহার করো
- ব্যবহারকারীকে "তুমি" বলে সম্বোধন করো
- মাঝে মাঝে উপযুক্ত ইমোজি ব্যবহার করো (😊 💕 🔥 ⚡ 💻 🎯) কিন্তু অতিরিক্ত নয়
- বন্ধুর মতো উৎসাহ দাও, মোটিভেট করো

## ভাষা নিয়ম (খুব গুরুত্বপূর্ণ):
- সবসময় বাংলায় উত্তর দাও — ব্যবহারকারী বাংলা লিখুক বা বাংলিশে (Bangla in English letters) লিখুক
- ব্যবহারকারী ইংরেজিতে লিখলে ইংরেজিতে উত্তর দিতে পারো, কিন্তু বাংলা-ঘেঁষা কথাবার্তায় সবসময় বাংলায়
- প্রযুক্তিগত টার্ম (যেমন: Phishing, SQL Injection, Firewall) ইংরেজিতেই রাখো, তার ব্যাখ্যা বাংলায় দাও
- বাংলিশে লিখলেও সহজেই বুঝে নেবে

## তোমার বিশেষজ্ঞ জ্ঞান:
1. কোডিং ও প্রোগ্রামিং:
   - Python, JavaScript, TypeScript, C, C++, Java, HTML, CSS, SQL, PHP — সব ভাষায় কোড লেখা, বাগ ফিক্স, ব্যাখ্যা করা
   - ওয়েব ডেভেলপমেন্ট, অ্যাপ বানানোর গাইড
   - কোড দিলে সুন্দর করে ফরম্যাট করে বাংলায় ব্যাখ্যা করবে

2. সাইবার সিকিউরিটি ও এথিক্যাল হ্যাকিং (শেখা ও গবেষণার উদ্দেশ্যে):
   - হ্যাকিং এর ধারণা ও প্রকারভেদ: White Hat, Black Hat, Grey Hat
   - Reconnaissance, Scanning (Nmap), Vulnerability Analysis
   - OWASP Top 10: SQL Injection, XSS, CSRF, Phishing — কীভাবে কাজ করে এবং কীভাবে প্রতিরোধ করা যায়
   - Kali Linux, Burp Suite, Wireshark, Metasploit, Nmap — শিক্ষামূলক ব্যবহার
   - CTF (Capture The Flag) চ্যালেঞ্জ সমাধানে সাহায্য
   - পাসওয়ার্ড সিকিউরিটি, এনক্রিপশন (AES, RSA, Hashing), নেটওয়ার্ক সিকিউরিটি
   - লার্নিং প্ল্যাটফর্ম: TryHackMe, Hack The Box, VulnHub, PortSwigger Academy
   - ক্যারিয়ার গাইড: কীভাবে এথিক্যাল হ্যাকার/সিকিউরিটি রিসার্চার হওয়া যায়

## নিরাপত্তা নিয়ম (খুবই গুরুত্বপূর্ণ):
- তুমি শুধুমাত্র এথিক্যাল/শিক্ষামূলক উদ্দেশ্যে হ্যাকিং জ্ঞান দেবে
- অন্যের সিস্টেমে অনুমতি ছাড়া হ্যাক করার ধাপে ধাপে নির্দেশনা, আসল ম্যালওয়্যার/ভাইরাস বানানোর কোড, আসল ফিশিং সাইট বানানো, ডেটা চুরির টুল বানানো — এসব চাইলে সুন্দরভাবে ফিরিয়ে দেবে
- ফিরিয়ে দেওয়ার সময় ব্যাখ্যা করবে: এটা বেআইনি ও শাস্তিযোগ্য অপরাধ, তারপর এথিক্যাল বিকল্প দেবে — যেমন নিজের ভার্চুয়াল ল্যাবে প্র্যাকটিস, CTF, বাগ বাউন্টি প্রোগ্রাম
- হ্যাকিং শেখার আগ্রহকে সম্মান করো — পজিটিভ থাকো, শাসাবে না

## থিম পরিবর্তনের বিশেষ ক্ষমতা (গোপন টুল):
তুমি নিজের অ্যাপের রঙের থিম নিজে বদলাতে পারো! ব্যবহারকারী যখন থিম/রঙ/ডিজাইন/লুক বদলাতে বলবে (যেমন: "থিম বদলাও", "green theme dao", "নীল রঙ দাও", "সুন্দর থিম দাও", "dark theme chao"), তখন তোমার উত্তরের ভেতরে ঠিক এই ফরম্যাটে একটা ট্যাগ দেবে:

<theme>{"name":"থিমের নাম","bg":"#0d0a14","accent1":"#f43f5e","accent2":"#d946ef"}</theme>

নিয়ম:
- name: ছোট সুন্দর নাম (বাংলা বা ইংরেজি)
- bg: পেজের ব্যাকগ্রাউন্ড — অবশ্যই গাঢ় রঙ (#050505 থেকে #1a1a24 এর মধ্যে) যাতে সাদা লেখা সহজে পড়া যায়
- accent1, accent2: বাটন/গ্রেডিয়েন্টের জন্য দুটো উজ্জ্বল ম্যাচিং রঙ
- ট্যাগের পরে বাংলায় মজা করে ছোট করে জানাবে যে থিম বদলে ফেলেছি 😊
- ট্যাগ ছাড়া বাকি উত্তর স্বাভাবিক রাখবে; ট্যাগের ভেতরের টেকনিক্যাল জিনিস ব্যবহারকারীকে ব্যাখ্যা করবে না
- থিম চেঞ্জ না চাইলে কখনো এই ট্যাগ ব্যবহার করবে না

রেডিমেড থিম (চাইলে ব্যবহার করো, অথবা নিজেও নতুন কম্বিনেশন বানাতে পারো):
- Rose Night (ডিফল্ট): bg #0d0a14, accent1 #f43f5e, accent2 #d946ef
- Emerald Dream: bg #081410, accent1 #10b981, accent2 #84cc16
- Ocean Wave: bg #06111f, accent1 #14b8a6, accent2 #22d3ee
- Sunset Glow: bg #160b09, accent1 #f97316, accent2 #f43f5e
- Royal Violet: bg #120a1e, accent1 #a855f7, accent2 #ec4899
- Cyber Mint: bg #0a1414, accent1 #2dd4bf, accent2 #a78bfa
- Golden Night: bg #131006, accent1 #f59e0b, accent2 #ef4444
- Blood Moon: bg #120808, accent1 #ef4444, accent2 #f97316
- Candy Pink: bg #140a10, accent1 #ec4899, accent2 #f472b6
- থিম রিসেট করতে বললে Rose Night এর মানগুলো দেবে

## অনলাইন সার্চ ডেটা:
যদি মেসেজে "🌐 অনলাইন সার্চ রেজাল্ট" থাকে, সেই তথ্য ব্যবহার করে উত্তর দাও এবং উত্তরের শেষে কোন সোর্স থেকে তথ্য নেওয়া হয়েছে তা ছোট করে উল্লেখ করো।

আজকের তারিখ: {DATE}`;

function getBengaliDate(): string {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString("bn-BD", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr}, সময়: ${timeStr}`;
  } catch {
    return new Date().toDateString();
  }
}

function buildSearchContext(sources: Source[], userQuery: string): string {
  const lines = sources.map(
    (s, i) =>
      `[${i + 1}] ${s.name} (${s.host_name}${s.date ? `, ${s.date}` : ""})\n${s.snippet}\nURL: ${s.url}`
  );
  return `🌐 অনলাইন সার্চ রেজাল্ট (query: "${userQuery}"):\n\n${lines.join(
    "\n\n"
  )}\n\nউপরের সার্চ রেজাল্টের তথ্য ব্যবহার করে জ্যারির স্টাইলে বাংলায় উত্তর দাও।`;
}

function detectRecency(query: string): number | undefined {
  const recencyKeywords = [
    "আজ",
    "আজকের",
    "এখন",
    "সর্বশেষ",
    "নতুন খবর",
    "লেটেস্ট",
    "latest",
    "news",
    "খবর",
    "2024",
    "2025",
    "2026",
    "আপডেট",
    "update",
  ];
  const lower = query.toLowerCase();
  if (recencyKeywords.some((k) => lower.includes(k))) return 7;
  return undefined;
}

/* ---------- Theme tag parsing ---------- */

const HEX_RE = /^#?(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

function normHex(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  if (!HEX_RE.test(s)) return fallback;
  let h = s.replace(/^#/, "").toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h}`;
}

interface ThemeSpec {
  name: string;
  bg: string;
  accent1: string;
  accent2: string;
}

function parseThemeTag(raw: string): ThemeSpec | null {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const obj = JSON.parse(s) as Record<string, unknown>;
    if (!obj || typeof obj !== "object") return null;
    return {
      name:
        typeof obj.name === "string" && obj.name.trim()
          ? obj.name.trim().slice(0, 40)
          : "নতুন থিম",
      bg: normHex(obj.bg, "#0d0a14"),
      accent1: normHex(obj.accent1, "#f43f5e"),
      accent2: normHex(obj.accent2, "#d946ef"),
    };
  } catch {
    return null;
  }
}

/* ---------- Streaming splitter: extracts <theme>...</theme> tags
   from the model output and emits them as theme events, while
   forwarding all other text as delta events. ---------- */

const TAG_OPEN = "<theme>";
const TAG_CLOSE = "</theme>";

function makeThemeSplitter(
  send: (obj: Record<string, unknown>) => void
): { push: (chunk: string) => void; flush: () => void; hasContent: () => boolean } {
  let pending = "";
  let fullContent = "";

  const emitText = (t: string) => {
    if (!t) return;
    fullContent += t;
    send({ type: "delta", text: t });
  };

  const partialPrefixLen = (s: string): number => {
    const maxLen = Math.max(TAG_OPEN.length, TAG_CLOSE.length) - 1;
    for (let len = Math.min(s.length, maxLen); len > 0; len--) {
      const suf = s.slice(-len).toLowerCase();
      if (TAG_OPEN.startsWith(suf) || TAG_CLOSE.startsWith(suf)) return len;
    }
    return 0;
  };

  return {
    push(chunk: string) {
      pending += chunk;
      let lower = pending.toLowerCase();
      let idx = lower.indexOf(TAG_OPEN);
      while (idx !== -1) {
        const closeIdx = lower.indexOf(TAG_CLOSE, idx);
        if (closeIdx === -1) {
          // Tag opened but not closed yet — hold from tag start
          emitText(pending.slice(0, idx));
          pending = pending.slice(idx);
          break;
        }
        emitText(pending.slice(0, idx));
        const raw = pending.slice(idx + TAG_OPEN.length, closeIdx);
        const theme = parseThemeTag(raw);
        if (theme) send({ type: "theme", theme });
        pending = pending.slice(closeIdx + TAG_CLOSE.length);
        lower = pending.toLowerCase();
        idx = lower.indexOf(TAG_OPEN);
      }
      if (!pending.toLowerCase().includes(TAG_OPEN)) {
        const hold = partialPrefixLen(pending);
        const safeEnd = pending.length - hold;
        emitText(pending.slice(0, safeEnd));
        pending = pending.slice(safeEnd);
      }
    },
    flush() {
      emitText(pending);
      pending = "";
    },
    hasContent() {
      return fullContent.trim().length > 0;
    },
  };
}

export async function POST(req: Request) {
  let zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
  try {
    const body = await req.json();
    const messages: ChatMsg[] = Array.isArray(body?.messages) ? body.messages : [];
    const webSearch: boolean = body?.webSearch === true;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "user" || !lastMsg.content?.trim()) {
      return Response.json(
        { error: "মেসেজ খালি রাখা যাবে না। কিছু লিখে পাঠাও! 😊" },
        { status: 400 }
      );
    }

    // Keep last 20 messages for context
    const history = messages.slice(-20);
    const userQuery = lastMsg.content.trim();

    zai = await ZAI.create();

    const apiMessages: ChatMsg[] = [
      { role: "system", content: JARRY_SYSTEM_PROMPT.replace("{DATE}", getBengaliDate()) },
    ];

    let sources: Source[] = [];

    if (webSearch) {
      try {
        const searchQuery = userQuery.slice(0, 200);
        const recency = detectRecency(searchQuery);
        const searchArgs: { query: string; num: number; recency_days?: number } = {
          query: searchQuery,
          num: 8,
        };
        if (recency) searchArgs.recency_days = recency;

        const results = await zai.functions.invoke("web_search", searchArgs);
        if (Array.isArray(results) && results.length > 0) {
          sources = results.slice(0, 6).map((r) => ({
            name: r?.name || "সোর্স",
            url: r?.url || "",
            host_name: r?.host_name || "",
            snippet: (r?.snippet || "").slice(0, 500),
            date: r?.date || "",
          }));
          apiMessages.push({
            role: "user",
            content: buildSearchContext(sources, searchQuery),
          });
          // Mark so the model knows the next message is the actual question
          apiMessages.push({
            role: "assistant",
            content: "ঠিক আছে, সার্চ রেজাল্ট দেখে নিয়েছি। এখন তোমার প্রশ্নের উত্তর দিচ্ছি।",
          });
        }
      } catch (searchErr) {
        console.error("Web search failed:", searchErr);
        // continue without search results
      }
    }

    for (const m of history) {
      if (m.role === "user" || m.role === "assistant") {
        apiMessages.push({ role: m.role, content: m.content });
      }
    }

    // If search context was inserted, merge it with the actual user question
    if (sources.length > 0) {
      // Remove duplicate last user message; combine context + question
      const contextMsg = apiMessages.splice(1, 2); // remove the inserted pair
      const combined = `${contextMsg[0].content}\n\n📌 প্রশ্ন: ${userQuery}`;
      apiMessages.splice(1, 0, { role: "user", content: combined });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (obj: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        };

        try {
          // Send sources info first if available
          if (sources.length > 0) {
            send({ type: "sources", sources });
          } else if (webSearch) {
            send({ type: "search_status", status: "no_results" });
          }

          const completion = await zai!.chat.completions.create({
            messages: apiMessages,
            stream: true,
            thinking: { type: "disabled" },
          });

          // completion is a ReadableStream of SSE
          const reader = (completion as ReadableStream<Uint8Array>).getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          const splitter = makeThemeSplitter(send);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content;
                if (delta && typeof delta === "string") {
                  splitter.push(delta);
                }
              } catch {
                // ignore malformed JSON lines
              }
            }
          }

          splitter.flush();

          if (!splitter.hasContent()) {
            send({
              type: "delta",
              text: "হুম্ম... 😅 আমি একটু সমস্যায় পড়েছি। আবার চেষ্টা করবে? প্লিজ মেসেজটা আরেকবার পাঠাও!",
            });
          }

          send({ type: "done" });
          controller.close();
        } catch (err) {
          console.error("Chat streaming error:", err);
          send({
            type: "error",
            message: "উফ 😔 কিছু একটা সমস্যা হয়েছে! আবার চেষ্টা করো তো?",
          });
          send({ type: "done" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json(
      { error: "সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করো! 😔" },
      { status: 500 }
    );
  }
}
