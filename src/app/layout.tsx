import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import NavHeader from "@/components/layout/NavHeader";
import { AuthProvider } from "@/components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Stock Analysis India",
    default: "Stock Analysis India — NSE & BSE Live Prices",
  },
  description:
    "Track NSE and BSE live stock prices, Nifty 50 and Sensex indices, manage your watchlist, build a portfolio, and plan SIP investments — all in one Indian stock market dashboard.",
  openGraph: {
    title: "Stock Analysis India — NSE & BSE Live Prices",
    description:
      "Track NSE and BSE live stock prices, Nifty 50 and Sensex indices, manage your watchlist, build a portfolio, and plan SIP investments.",
    type: "website",
    locale: "en_IN",
  },
  manifest: "/manifest.json",
};

// Light-mode --background is 0 0% 100% → #ffffff
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NavHeader />
            {children}
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
