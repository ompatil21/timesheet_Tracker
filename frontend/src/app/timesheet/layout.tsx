import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timesheet',
  description: "Log and review the hours you have worked.",
  alternates: { canonical: '/timesheet' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
