import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & conditions',
  description: 'The terms for using Time Tracker.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & conditions" updated="10 November 2026">
      <p>
        By creating an account or using Time Tracker you agree to these terms. If you don&apos;t agree, please
        don&apos;t use the service.
      </p>

      <h2>The service</h2>
      <p>
        Time Tracker lets you record hours worked, sync rosters and compare payslips with your tracked time. We may
        change, improve or remove features over time.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate details and keep your password private. You are responsible for activity on your account.</li>
        <li>You must be old enough to enter into this agreement where you live.</li>
        <li>One person per account. Don&apos;t create accounts automatically or in bulk.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t misuse the service. That includes trying to access other people&apos;s data, overloading or
        probing our systems, uploading malicious files, or using the service for anything unlawful.
      </p>

      <h2>Your data</h2>
      <p>
        You own the information you put into Time Tracker. You give us permission to store and process it only to
        provide the service. See our <Link href="/privacy">privacy policy</Link> for details.
      </p>

      <h2>Payslip checks are a guide</h2>
      <p>
        Pay calculations and payslip comparisons are estimates based on the hours, rates and documents you provide.
        They are not financial, legal or tax advice. Always confirm discrepancies with your employer, your award or
        agreement, or the Fair Work Ombudsman before acting on them.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep Time Tracker running, but it is provided &quot;as is&quot; and may sometimes be unavailable.
        Keep your own copies of anything important.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, we aren&apos;t liable for indirect or consequential loss, or for losses caused
        by relying on calculations in the app. Nothing in these terms limits rights you have under the Australian
        Consumer Law.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can stop using the service at any time and ask us to delete your account. We may suspend accounts that
        break these terms.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. We&apos;ll change the date above, and continuing to use the service means you
        accept the new terms. These terms are governed by the laws of Australia.
      </p>
    </LegalPage>
  );
}
