import type { Metadata } from "next";
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
  title: "SocialBoost - Free YouTube & Instagram Growth Platform | Real Views, Followers & Engagement",
  description: "Get free YouTube views, Instagram followers, likes, and comments from real users. Boost your social media presence with our safe and effective growth platform.",
  keywords: ["social media growth", "YouTube views", "Instagram followers", "free subscribers", "social media marketing", "engagement booster", "views generator"],
  authors: [{ name: "SocialBoost Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SocialBoost - Free YouTube & Instagram Growth Platform",
    description: "Get free YouTube views, Instagram followers, likes, and comments from real users. Start growing today!",
    url: "https://socialboost.app",
    siteName: "SocialBoost",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialBoost - Free YouTube & Instagram Growth",
    description: "Get free YouTube views, Instagram followers, likes, and comments from real users.",
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
      </body>
    </html>
  );
}
