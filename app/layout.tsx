import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MENLYLA | Menu Digital & Paiement",
  description: "La solution de commande et paiement pour restaurants en Côte d'Ivoire",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logos/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/logos/logo-icon.svg",

  },
};

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased font-sans overflow-x-hidden relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
