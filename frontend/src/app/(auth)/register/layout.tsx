import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create your account',
  description: "Create a free Time Tracker account. Log your hours and check every payslip against what you actually worked.",
  alternates: { canonical: '/register' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
