import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MENLYLA | Menu Digital & Paiement",
  description: "La solution de commande et paiement pour restaurants en Côte d'Ivoire",
  icons: {
    icon: "/favicon.ico",
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
        className={`${poppins.variable} antialiased font-sans`}
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
