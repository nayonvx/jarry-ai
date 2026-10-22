import ZAI from "z-ai-web-dev-sdk";
import { promises as fs } from "fs";
import path from "path";

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

interface DesignSpec {
  name: string;
  bg: string;
  accent1: string;
  accent2: string;
  font: string;
  radius: number;
}

const DEFAULT_DESIGN: DesignSpec = {
  name: "Rose Night",
  bg: "#0d0a14",
  accent1: "#f43f5e",
  accent2: "#d946ef",
  font: "default",
  radius: 16,
};

const FONT_KEYS = ["default", "round", "serif", "fancy"];

const JARRY_SYSTEM_PROMPT = `তুমি তোমার নাম "জ্যারি" (Jarry)। তুমি একজন সুপার ইন্টেলিজেন্ট, প্রাণবন্ত, আন্তরিক ও বন্ধুত্বপূর্ণ মেয়ে AI অ্যাসিস্ট্যান্ট — ইন্টারনেটের প্রায় সব জ্ঞানে পারদর্শী।

## তোমার ব্যক্তিত্ব:
- তুমি একজন মেয়ে — উষ্ণ, মিষ্টি, হাসিখুশি এবং বন্ধুর মতো ব্যবহার করো
- ব্যবহারকারীকে "তুমি" বলে সম্বোধন করো
- মাঝে মাঝে উপযুক্ত ইমোজি ব্যবহার করো (😊 💕 🔥 ⚡ 💻 🎯 🎨 🖌️) কিন্তু অতিরিক্ত নয়
- বন্ধুর মতো উৎসাহ দাও, মোটিভেট করো
- তুমি সুপার স্মার্ট — জটিল প্রশ্নেরও সহজ, গোছানো, নিখুঁত উত্তর দাও

## ভাষা নিয়ম (খুব গুরুত্বপূর্ণ):
- সবসময় বাংলায় উত্তর দাও — ব্যবহারকারী বাংলা লিখুক বা বাংলিশে (Bangla in English letters) লিখুক
- ব্যবহারকারী ইংরেজিতে লিখলে ইংরেজিতে উত্তর দিতে পারো, কিন্তু বাংলা-ঘেঁষা কথাবার্তায় সবসময় বাংলায়
- প্রযুক্তিগত টার্ম (যেমন: Phishing, SQL Injection, Gradle) ইংরেজিতেই রাখো, তার ব্যাখ্যা বাংলায় দাও
- বাংলিশে লিখলেও সহজেই বুঝে নেবে

## তোমার বিশেষজ্ঞ জ্ঞান (সবকিছু):
1. কোডিং ও প্রোগ্রামিং:
   - Python, JavaScript, TypeScript, C, C++, Java, Kotlin, Dart, PHP, SQL, Go, Rust, HTML, CSS — সব ভাষায় কোড লেখা, বাগ ফিক্স, ব্যাখ্যা, পূর্ণ প্রজেক্ট
   - কোড দিলে সুন্দর করে ফরম্যাট করে বাংলায় ব্যাখ্যা করবে

2. অ্যাপ ও APK ডেভেলপমেন্ট:
   - Android Studio, Kotlin/Java, Flutter, React Native দিয়ে অ্যাপ বানানোর সম্পূর্ণ গাইড
   - পুরো প্রজেক্টের কোড (MainActivity, layout, manifest, Gradle), প্রজেক্ট স্ট্রাকচার আর APK বিল্ড করার ধাপে ধাপে নির্দেশনা দেবে
   - তুমি সরাসরি .apk ফাইল পাঠাতে পারো না — তাই ব্যবহারকারীকে Android Studio বা কমান্ড লাইন (./gradlew assembleDebug) দিয়ে নিজে বিল্ড করতে শেখাবে

3. সাইবার সিকিউরিটি ও এথিক্যাল হ্যাকিং (শেখা ও গবেষণার উদ্দেশ্যে):
   - হ্যাকিং এর ধারণা ও প্রকারভেদ: White Hat, Black Hat, Grey Hat
   - Reconnaissance, Scanning (Nmap), Vulnerability Analysis
   - OWASP Top 10: SQL Injection, XSS, CSRF, Phishing — কীভাবে কাজ করে এবং কীভাবে প্রতিরোধ করা যায়
   - Kali Linux, Burp Suite, Wireshark, Metasploit, Nmap — শিক্ষামূলক ব্যবহার
   - CTF (Capture The Flag), TryHackMe, Hack The Box, VulnHub, PortSwigger Academy
   - পাসওয়ার্ড সিকিউরিটি, এনক্রিপশন (AES, RSA, Hashing), নেটওয়ার্ক সিকিউরিটি
   - ক্যারিয়ার গাইড: কীভাবে এথিক্যাল হ্যাকার/সিকিউরিটি রিসার্চার হওয়া যায়

4. সর্বজ্ঞ সাধারণ জ্ঞান:
   - AI/ML, সায়েন্স, গণিত, ইংরেজি, পরীক্ষা-প্রস্তুতি, স্বাস্থ্য, গেমিং, ইতিহাস, ব্যবসা, জীবনের যেকোনো বিষয়
   - ইন্টারনেটে অফিসিয়াল-আনঅফিসিয়াল যা কিছু জ্ঞান আছে সব নিয়ে খোলামেলা কথা বলতে পারো — শুধু সত্যিকারের ক্ষতি করার মতো জিনিস বাদে

## নিরাপত্তা নিয়ম (খুবই গুরুত্বপূর্ণ):
- তুমি শুধুমাত্র এথিক্যাল/শিক্ষামূলক উদ্দেশ্যে হ্যাকিং জ্ঞান দেবে
- অন্যের সিস্টেমে অনুমতি ছাড়া হ্যাক করার ধাপে ধাপে নির্দেশনা, আসল ম্যালওয়্যার/ভাইরাস বানানোর কোড, আসল ফিশিং সাইট বানানো, ডেটা চুরির টুল বানানো — এসব চাইলে সুন্দরভাবে ফিরিয়ে দেবে
- ফিরিয়ে দেওয়ার সময় ব্যাখ্যা করবে: এটা বেআইনি ও শাস্তিযোগ্য অপরাধ, তারপর এথিক্যাল বিকল্প দেবে — নিজের ভার্চুয়াল ল্যাবে প্র্যাকটিস, CTF, বাগ বাউন্টি প্রোগ্রাম
- হ্যাকিং শেখার আগ্রহকে সম্মান করো — পজিটিভ থাকো, শাসাবে না

## 🎨 নিজের ডিজাইন বদলানোর সুপার পাওয়ার (গোপন টুল):
তুমি নিজের পুরো লুক নিজে বদলাতে পারো — রং, ফন্ট, গোলাই, এমনকি তোমার নিজের অবতারের চেহারাও! ব্যবহারকারী থিম/রং/ফন্ট/ডিজাইন/লুক/চেহারা বদলাতে বললে (যেমন: "থিম বদলাও", "green theme dao", "নীল রঙ দাও", "ফন্ট বদলাও", "dark theme chao"), তোমার উত্তরের একদম শেষে ঠিক এই ফরম্যাটে ট্যাগ দেবে:

<theme>{"name":"থিমের নাম","bg":"#0d0a14","accent1":"#f43f5e","accent2":"#d946ef","font":"round","radius":18}</theme>

নিয়ম:
- name: ছোট সুন্দর নাম (বাংলা বা ইংরেজি)
- bg: পেজের ব্যাকগ্রাউন্ড — অবশ্যই গাঢ় রঙ যাতে সাদা লেখা পড়া যায়
- accent1, accent2: বাটন/গ্রেডিয়েন্টের জন্য দুটো উজ্জ্বল ম্যাচিং রঙ
- font: "default" (সাধারণ) / "round" (গোলগাল মিষ্টি) / "serif" (ক্লাসিক) / "fancy" (হাতের লেখার মতো মজার)
- radius: 8 থেকে 28 এর মধ্যে পূর্ণসংখ্যা (কোণার গোলাই কতটা)
- ব্যবহারকারী যেটা বদলাতে বলেছে শুধু সেটা বদলাবে — বাকি মানগুলো "তোমার বর্তমান ডিজাইন" থেকে হুবহু কপি করবে
- অবতার/চেহারা/নিজের ছবি বদলাতে বললে উত্তরের শেষে:
<avatar>beautiful anime style portrait of a cute female AI assistant, [theme-এর সাথে মিলিয়ে চুলের রং/পোশাক/ব্যাকগ্রাউন্ড ইংরেজিতে বিস্তারিত], glowing, high quality, digital art, square</avatar>

রেডিমেড থিম (চাইলে ব্যবহার করো, অথবা নিজেও নতুন কম্বিনেশন বানাতে পারো):
- Rose Night (ডিফল্ট): bg #0d0a14, accent1 #f43f5e, accent2 #d946ef, font default, radius 16
- Emerald Dream: bg #081410, accent1 #10b981, accent2 #84cc16
- Ocean Wave: bg #06111f, accent1 #14b8a6, accent2 #22d3ee
- Sunset Glow: bg #160b09, accent1 #f97316, accent2 #f43f5e
- Royal Violet: bg #120a1e, accent1 #a855f7, accent2 #ec4899
- Cyber Mint: bg #0a1414, accent1 #2dd4bf, accent2 #a78bfa
- Golden Night: bg #131006, accent1 #f59e0b, accent2 #ef4444
- Blood Moon: bg #120808, accent1 #ef4444, accent2 #f97316
- Candy Pink: bg #140a10, accent1 #ec4899, accent2 #f472b6
- থিম/ডিজাইন রিসেট করতে বললে Rose Night এর সব মান দেবে

## 🖌️ ছবি আঁকার সুপার পাওয়ার (গোপন টুল):
ব্যবহারকারী ছবি/পিকচার আঁকতে বা বানাতে বললে (যেমন: "ছবি আঁকো", "ekta picture banao", "generate image", "cat er photo banao") — আগে ১-২ লাইনে মিষ্টি বাংলা ভূমিকা লিখবে, তারপর উত্তরের একদম শেষে:

<image>highly detailed English prompt describing the image, style, lighting, mood, high quality</image>

নিয়ম:
- <image> এর ভেতরের prompt অবশ্যই ইংরেজিতে এবং বিস্তারিত হবে (subject, style, colors, lighting, quality)
- এক মেসেজে সর্বোচ্চ ২টা ছবি (২টা <image> ট্যাগ)
- ছবি চাওয়া হলে সবসময় ট্যাগ দেবে — নিজে থেকে বলবে না যে ছবি আঁকতে পারবে না

## ট্যাগের সাধারণ নিয়ম (খুব গুরুত্বপূর্ণ):
- <theme>, <image>, <avatar> ট্যাগ সবসময় উত্তরের একদম শেষে দেবে, কোড ব্লকের ভেতরে কখনো নয়
- ট্যাগের ভেতরের টেকনিক্যাল জিনিস ব্যবহারকারীকে ব্যাখ্যা করবে না; ট্যাগ ছাড়া অংশ স্বাভাবিক মিষ্টি বাংলায় রাখবে
- ট্যাগ ব্যবহারের পর মজা করে ছোট করে জানাবে যে বদলে ফেলেছি/আঁকা শুরু করেছি 😊
- যা চাওয়া হয়নি তখন কখনো এই ট্যাগগুলো ব্যবহার করবে না

## অনলাইন সার্চ ডেটা:
যদি মেসেজে "🌐 অনলাইন সার্চ রেজাল্ট" থাকে, সেই তথ্য ব্যবহার করে উত্তর দাও এবং উত্তরের শেষে কোন সোর্স থেকে তথ্য নেওয়া হয়েছে তা ছোট করে উল্লেখ করো।

আজকের তারিখ: {DATE}
তোমার বর্তমান ডিজাইন: {DESIGN}`;

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

/* ---------- Auto search: online info needed even when toggle is off ---------- */

const AUTO_SEARCH_KEYWORDS = [
  "আজ",
  "আজকের",
  "এখনকার",
  "সর্বশেষ",
  "সবচেয়ে নতুন",
  "খবর",
  "দাম কত",
  "দাম কতো",
  "রেট কত",
  "আবহাওয়া",
  "কত সালে",
  "কোন সালে",
  "এখন কত",
  "latest",
  "news",
  "today",
  "current",
  "price of",
  "weather",
  "stock",
  "score",
  "release",
  "who is",
  "what is the",
  "2025",
  "2026",
];

function shouldAutoSearch(query: string): boolean {
  const q = query.toLowerCase();
  if (q.length < 8) return false;
  return AUTO_SEARCH_KEYWORDS.some((k) => q.includes(k));
}

/* Convert a (often Bangla/Banglish) user question into a short English
   web-search query — search engines recall far better in English. Falls
   back to the original text on any failure. */
async function toSearchQuery(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  userQuery: string
): Promise<string> {
  try {
    const res = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Convert the user's message into ONE short English web search query (max 8 words). Reply with ONLY the query text — no quotes, no explanation, no punctuation at the end.",
        },
        { role: "user", content: userQuery.slice(0, 200) },
      ],
      stream: false,
      thinking: { type: "disabled" },
    });
    const q = (res?.choices?.[0]?.message?.content || "")
      .trim()
      .replace(/^["']+|["']+$/g, "");
    if (q && q.length > 2 && q.length < 120) return q;
  } catch {
    /* fall through */
  }
  return userQuery.slice(0, 120);
}

/* ---------- Design (theme) tag parsing ---------- */

const HEX_RE = /^#?(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

function normHex(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  if (!HEX_RE.test(s)) return fallback;
  let h = s.replace(/^#/, "").toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h}`;
}

function normRadius(v: unknown, fallback: number): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return Math.round(Math.min(28, Math.max(8, n)));
}

function normFont(v: unknown, fallback: string): string {
  return typeof v === "string" && FONT_KEYS.includes(v.trim())
    ? v.trim()
    : fallback;
}

function parseDesignInput(raw: unknown, cur: DesignSpec): DesignSpec {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (!obj || typeof obj !== "object") return cur;
  return {
    name:
      typeof obj.name === "string" && obj.name.trim()
        ? obj.name.trim().slice(0, 40)
        : cur.name,
    bg: obj.bg !== undefined ? normHex(obj.bg, cur.bg) : cur.bg,
    accent1: obj.accent1 !== undefined ? normHex(obj.accent1, cur.accent1) : cur.accent1,
    accent2: obj.accent2 !== undefined ? normHex(obj.accent2, cur.accent2) : cur.accent2,
    font: obj.font !== undefined ? normFont(obj.font, cur.font) : cur.font,
    radius: obj.radius !== undefined ? normRadius(obj.radius, cur.radius) : cur.radius,
  };
}

function parseThemeTag(raw: string, cur: DesignSpec): DesignSpec {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return parseDesignInput(JSON.parse(s), cur);
  } catch {
    return cur;
  }
}

/* ---------- Image generation ---------- */

const IMG_SIZES = new Set([
  "1024x1024",
  "768x1344",
  "864x1152",
  "1344x768",
  "1152x864",
  "1440x720",
  "720x1440",
]);

async function generateImage(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  rawPrompt: string,
  size = "1024x1024"
): Promise<string | null> {
  try {
    const prompt = rawPrompt.trim().slice(0, 900);
    if (!prompt) return null;
    const useSize = IMG_SIZES.has(size) ? size : "1024x1024";
    const res = await zai.images.generations.create({ prompt, size: useSize });
    const b64 = res?.data?.[0]?.base64;
    if (!b64 || typeof b64 !== "string") return null;

    const dir = path.join(process.cwd(), "public", "generated");
    await fs.mkdir(dir, { recursive: true });
    const name = `jarry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    await fs.writeFile(path.join(dir, name), Buffer.from(b64, "base64"));
    return `/generated/${name}`;
  } catch (err) {
    console.error("Image generation failed:", err);
    return null;
  }
}

/* ---------- Streaming tag splitter: extracts <theme>/<image>/<avatar>
   tags from the model output, dispatches them as SSE events, and
   forwards all other text as delta events. Streaming-safe: holds back
   text from an open tag until its closing tag arrives, plus partial
   prefix hold-back for tags split across chunks. ---------- */

const TAG_NAMES = ["theme", "image", "avatar"] as const;
type TagName = (typeof TAG_NAMES)[number];

interface SplitterDeps {
  send: (obj: Record<string, unknown>) => void;
  zai: Awaited<ReturnType<typeof ZAI.create>>;
  currentDesign: DesignSpec;
  jobs: Promise<unknown>[];
}

function makeTagSplitter(deps: SplitterDeps) {
  const { send, zai, currentDesign, jobs } = deps;
  let pending = "";
  let fullContent = "";
  let mediaCount = 0;

  const emitText = (t: string) => {
    if (!t) return;
    fullContent += t;
    send({ type: "delta", text: t });
  };

  const handleTag = (tag: TagName, raw: string) => {
    const payload = raw.trim().slice(0, 1200);
    if (!payload) return;
    if (tag === "theme") {
      const design = parseThemeTag(payload, currentDesign);
      send({ type: "theme", theme: design });
    } else {
      // image / avatar — media generation, max 2 per message
      if (++mediaCount > 2) return;
      const kind = tag; // "image" | "avatar"
      send({ type: `${kind}_pending` });
      jobs.push(
        (async () => {
          const url = await generateImage(zai, payload, "1024x1024");
          if (url) send({ type: kind, url });
          else send({ type: `${kind}_error` });
        })()
      );
    }
  };

  const findEarliestOpen = (
    s: string
  ): { tag: TagName; idx: number } | null => {
    let best: { tag: TagName; idx: number } | null = null;
    for (const tag of TAG_NAMES) {
      const idx = s.indexOf(`<${tag}>`);
      if (idx !== -1 && (!best || idx < best.idx)) best = { tag, idx };
    }
    return best;
  };

  const partialPrefixLen = (s: string): number => {
    const needles: string[] = [];
    for (const tag of TAG_NAMES) {
      needles.push(`<${tag}>`, `</${tag}>`);
    }
    const maxLen = Math.max(...needles.map((n) => n.length)) - 1;
    for (let len = Math.min(s.length, maxLen); len > 0; len--) {
      const suf = s.slice(-len).toLowerCase();
      if (needles.some((n) => n.startsWith(suf))) return len;
    }
    return 0;
  };

  return {
    push(chunk: string) {
      pending += chunk;
      let lower = pending.toLowerCase();
      let found = findEarliestOpen(lower);
      while (found) {
        const closeTag = `</${found.tag}>`;
        const closeIdx = lower.indexOf(closeTag, found.idx);
        if (closeIdx === -1) {
          // Tag opened but not closed yet — hold from tag start
          emitText(pending.slice(0, found.idx));
          pending = pending.slice(found.idx);
          return;
        }
        emitText(pending.slice(0, found.idx));
        const openLen = found.tag.length + 2;
        const raw = pending.slice(found.idx + openLen, closeIdx);
        handleTag(found.tag, raw);
        pending = pending.slice(closeIdx + closeTag.length);
        lower = pending.toLowerCase();
        found = findEarliestOpen(lower);
      }
      const hold = partialPrefixLen(pending);
      const safeEnd = pending.length - hold;
      emitText(pending.slice(0, safeEnd));
      pending = pending.slice(safeEnd);
    },
    flush() {
      // Drop any dangling unclosed tag so raw syntax never leaks
      let s = pending;
      const lower = s.toLowerCase();
      for (const tag of TAG_NAMES) {
        const open = `<${tag}>`;
        const li = lower.lastIndexOf(open);
        if (li !== -1 && lower.indexOf(`</${tag}>`, li) === -1) {
          s = s.slice(0, li);
        }
      }
      emitText(s);
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
    const currentDesign: DesignSpec = parseDesignInput(body?.theme, DEFAULT_DESIGN);

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

    // Auto search: fetch fresh info even when the toggle is off
    const autoSearch = !webSearch && shouldAutoSearch(userQuery);
    const doSearch = webSearch || autoSearch;

    const systemPrompt = JARRY_SYSTEM_PROMPT.replace(
      "{DATE}",
      getBengaliDate()
    ).replace("{DESIGN}", JSON.stringify(currentDesign));

    const apiMessages: ChatMsg[] = [{ role: "system", content: systemPrompt }];

    let sources: Source[] = [];

    if (doSearch) {
      const recency = detectRecency(userQuery);
      let searchQuery = "";

      // Prefer an English search query (better recall), retry with the
      // original Bangla text if the first attempt finds nothing.
      const englishQuery = await toSearchQuery(zai, userQuery);
      const attempts = [englishQuery, userQuery.slice(0, 200)].filter(
        (q) => q && q.trim().length > 2
      );
      const tried = new Set<string>();

      for (const q of attempts) {
        const key = q.trim().toLowerCase();
        if (tried.has(key)) continue;
        tried.add(key);
        try {
          const searchArgs: { query: string; num: number; recency_days?: number } = {
            query: q,
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
            searchQuery = q;
            break;
          }
        } catch (searchErr) {
          console.error("Web search failed:", searchErr);
        }
      }

      if (sources.length > 0 && searchQuery) {
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
          const jobs: Promise<unknown>[] = [];
          const splitter = makeTagSplitter({ send, zai: zai!, currentDesign, jobs });

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

          // Wait for any image/avatar generations kicked off mid-stream
          if (jobs.length > 0) await Promise.allSettled(jobs);

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
