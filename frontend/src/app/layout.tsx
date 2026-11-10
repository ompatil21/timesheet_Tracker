import type { Metadata, Viewport } from "next";
import { Caveat, Patrick_Hand, Courier_Prime } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const patrickHand = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick-hand" });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier-prime" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Track hours and check your payslip`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["timesheet", "time tracking", "payslip checker", "shift tracker", "hours log", "wage check"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Your time, your invoice.`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Your time, your invoice.`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F1EADB",
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
