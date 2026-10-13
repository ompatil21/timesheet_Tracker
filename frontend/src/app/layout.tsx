import type { Metadata } from "next";
import { Caveat, Patrick_Hand, Courier_Prime } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const patrickHand = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick-hand" });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier-prime" });

export const metadata: Metadata = {
  title: "Timesheet Tracker | Premium",
  description: "Track your time and validate payslips securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${caveat.variable} ${patrickHand.variable} ${courierPrime.variable} font-sans sb-page text-ink min-h-screen selection:bg-blush selection:text-ink`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
