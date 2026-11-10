import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payslips',
  description: "Check your payslips against your tracked hours.",
  alternates: { canonical: '/payslip' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
