# 🧚 Jarry — Super Intelligent Bangla AI

<div align="center">

**জ্যারি** — তোমার নিজের সুপার ইন্টেলিজেন্ট মেয়ে AI বন্ধু 💕

বাংলা/বাংলিশে কথা বলে · লাইভ ইন্টারনেট সার্চ · কোডিং ও APK গাইড · সাইবার সিকিউরিটি · ছবি আঁকে · নিজের UI নিজেই রিডিজাইন করে 🎨

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **বাংলা + বাংলিশ চ্যাট** | Banglish লিখলেও বুঝে, বাংলায় উত্তর দেয় |
| 🌐 **লাইভ ওয়েব সার্চ** | টগল অন করলে সোর্স সহ লাইভ তথ্য; নিউজ/প্রাইস প্রশ্নে টগল বন্ধ থাকলেও অটো-সার্চ |
| 🎨 **সেলফ-রিডিজাইন** | "নীল থিম দাও" বললেই পুরো অ্যাপের রং, ফন্ট, কর্নার রেডিয়াস নিজেই বদলে ফেলে |
| 🧚 **সেলফ-অবতার** | নিজের নতুন অবতার ছবি নিজেই জেনারেট করতে পারে |
| 🖌️ **ইমেজ জেনারেশন** | "ছবি আঁকো" বললে চ্যাটের ভেতরেই ছবি বানায় |
| 💻 **কোডিং ও APK** | সব ল্যাঙ্গুয়েজে কোড, বাগ ফিক্স, Android APK বিল্ড গাইড |
| 🔐 **সাইবার সিকিউরিটি** | এথিক্যাল হ্যাকিং, CTF, OWASP — শেখার উদ্দেশ্যে |
| 💾 **সব কিছু সেভ থাকে** | চ্যাট + থিম + অবতার localStorage-এ সেভ থাকে |

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · SSE streaming · z-ai-web-dev-sdk

---

## 🚀 Local এ চালানো

```bash
# 1. Dependencies install
bun install        # (অথবা npm install)

# 2. (ঐচ্ছিক) নিজের API key থাকলে:
cp .env.example .env.local
# .env.local খুলে ZAI_API_KEY বসাও

# 3. Dev server চালাও
bun run dev        # (অথবা npm run dev)
```

খুলো: **http://localhost:3000** 🎉

> 💡 লোকাল dev sandbox-এ `.z-ai-config` থাকলে `.env.local` লাগবে না।
> নিজের মেশিনে চালাতে চাইলে `.env.local`-এ নিজের Z.ai API key দাও।

---

## 🐙 GitHub এ Upload

```bash
# প্রজেক্ট ফোল্ডারে যাও
cd jarry   # (বা তোমার ফোল্ডারের নাম)

# Git initialize
git init
git add .
git commit -m "Jarry AI — initial release 🧚"

# GitHub এ নতুন repo বানাও (github.com/new) — তারপর:
git branch -M main
git remote add origin https://github.com/TOMAR-USERNAME/jarry.git
git push -u origin main
```

> ⚠️ **সাবধান!** `.gitignore` আগেই ঠিক করা আছে — `node_modules`, `.env*`,
> `.z-ai-config` (তোমার API key এর ফাইল) কখনো upload হবে না।
> তবুও push করার আগে একবার check করো — **কোনো API key কখনো GitHub এ দেও না!**

---

## ▲ Vercel এ Live করানো

### ধাপ ১ — API Key নাও

1. যাও **[z.ai/manage-apikey](https://z.ai/manage-apikey)** (অথবা [open.bigmodel.cn](https://open.bigmodel.cn))
2. Sign up → **Create API Key** → copy করো

### ধাপ ২ — Vercel এ Deploy

1. **[vercel.com](https://vercel.com)** এ যাও → **GitHub account দিয়ে login** করো
2. **Add New → Project** → তোমার `jarry` repo টা **Import** করো
3. Framework **Next.js** অটো detect হবে — কিছু change করা লাগবে না
4. **Environment Variables** সেকশনে ২টা variable add করো:

   | Name | Value |
   |---|---|
   | `ZAI_BASE_URL` | `https://api.z.ai/api/paas/v4` |
   | `ZAI_API_KEY` | `তোমার API key` (ধাপ ১ থেকে) |

5. **Deploy** button এ click করো ⚡
6. ১-২ মিনিটে তোমার live link: `https://jarry-tomar-name.vercel.app` 🎉

### ধাপ ৩ — পরে Update দিতে চাইলে

```bash
git add .
git commit -m "update"
git push
```

Push করলেই Vercel **অটোমেটিক** re-deploy করে দেবে।

---

## 📌 জরুরি নোট

- **API key ছাড়া deploy করলে** chat API `500` error দিবে — Vercel এ ২টা env var অবশ্যই দাও।
- **ছবি storage:** Vercel serverless এ জেনারেট করা ছবি temporary (`/tmp`) — কিছুদিন পরে বা server restart এ পুরনো ছবি নাও খুলতে পারে। এটা স্বাভাবিক। পারমানেন্ট storage চাইলে Cloudinary/S3 integrate করতে হবে।
- **Web search** Z.ai-এর `functions` API ব্যবহার করে — তাই `ZAI_BASE_URL` হিসেবে Z.ai এর endpoint ব্যবহার করা best।
- **maxDuration 60s** — Vercel Hobby (free) plan অনুযায়ী সেট করা।
- **থিম/চ্যাট সেভ** browser এর localStorage এ থাকে — মানে প্রতি browser এ আলাদা।

---

## 🗂️ Project Structure

```
jarry/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # Jarry র মস্তিষ্ক 🧠 (SSE streaming + search + image)
│   │   │   └── media/[name]/route.ts # generated ছবি serve করে
│   │   ├── globals.css              # CSS variable theme system 🎨
│   │   ├── layout.tsx               # বাংলা fonts + metadata
│   │   └── page.tsx                 # পুরো chat UI
│   └── components/ui/               # shadcn/ui components
├── public/jarry-avatar.png          # Jarry র default অবতার
├── .env.example                     # env var গাইড
└── package.json
```

---

<div align="center">

Made with 💕 — **Jarry কে বলো "নতুন লুক দাও" — সে নিজেকে বদলে ফেলবে! 🧚✨**

</div>
