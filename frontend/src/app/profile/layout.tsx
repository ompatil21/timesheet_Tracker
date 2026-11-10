import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employers',
  description: "Manage your employers, pay rates and roster sync.",
  alternates: { canonical: '/profile' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
