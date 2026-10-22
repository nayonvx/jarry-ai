import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jarry ⚡ — তোমার বাংলা হ্যাকার গার্ল AI",
  description:
    "জ্যারি — একজন cool হ্যাকার-টাইপ মেয়ে AI। বাংলায় কথা বলো, কোডিং শেখো, এথিক্যাল হ্যাকিং ও সাইবার সিকিউরিটি নিয়ে জানো, ছবি বানাও, আর অনলাইন থেকে সর্বশেষ তথ্য পাও।",
  keywords: [
    "Jarry",
    "জ্যারি",
    "বাংলা AI",
    "Bengali AI chatbot",
    "AI girlfriend assistant",
    "coding assistant",
    "ethical hacking",
    "cyber security",
  ],
  authors: [{ name: "Jarry AI" }],
  icons: {
    icon: "/jarry-avatar.png",
    apple: "/jarry-avatar.png",
  },
  openGraph: {
    title: "Jarry ⚡ — তোমার বাংলা হ্যাকার গার্ল AI",
    description: "বাংলায় কথা বলা হ্যাকার গার্ল AI — কোডিং, এথিক্যাল হ্যাকিং ও সব প্রশ্নের সঙ্গী",
    siteName: "Jarry AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050806",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Baloo+Da+2:wght@400;500;600;700;800&family=Noto+Serif+Bengali:wght@400;600;700&family=Galada&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
