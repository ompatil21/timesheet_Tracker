import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: "Sign in to Time Tracker to log your hours and check your payslips.",
  alternates: { canonical: '/login' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
