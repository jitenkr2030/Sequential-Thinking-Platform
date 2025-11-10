import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sequential Thinking Platform - Global Education & Exam Intelligence",
  description: "Transform learning through structured, step-by-step reasoning across multiple professional domains. AI-powered sequential thinking for finance, law, medicine, engineering, and more.",
  keywords: ["Sequential Thinking", "AI Learning", "Education", "Reasoning", "Professional Development", "Exam Preparation", "Finance", "Law", "Medicine", "Engineering"],
  authors: [{ name: "Sequential Thinking Platform Team" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Sequential Thinking Platform",
    description: "Transform learning through structured, step-by-step reasoning across multiple professional domains",
    url: "https://sequential-thinking-platform.com",
    siteName: "Sequential Thinking Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sequential Thinking Platform",
    description: "Transform learning through structured, step-by-step reasoning",
  },
  other: {
    "theme-color": "#3b82f6",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "SeqThink",
    "mobile-web-app-capable": "yes",
    "application-name": "Sequential Thinking Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
