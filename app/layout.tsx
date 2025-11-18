import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medium Clone - Where Good Ideas Find You",
  description: "A modern publishing platform for writers and readers to share and discover stories, thinking, and expertise.",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
