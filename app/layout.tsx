import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
// Notice: ChatWidget import is completely removed

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Up4TexAll - Sustainable Fashion Marketplace",
  description: "Connect supply of upcyclable textiles with conscious fashion firms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Dark theme background and text colors applied here */}
      <body className={`${inter.className} bg-[#121212] text-white antialiased`}>
        {/* AuthProvider must wrap children so Firebase knows who is logged in */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}