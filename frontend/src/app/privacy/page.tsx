import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What Time Tracker collects, why, how it is protected, and how to delete it.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="10 November 2026">
      <p>
        Time Tracker helps you log the hours you work and check your payslips against them. This page explains
        what information we keep to do that, and what we don&apos;t.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your name, email address and password. Passwords are stored only as a salted hash, never in plain text.</li>
        <li><strong>Work records:</strong> the employers or clients you add, pay rates, time logs, shifts and notes you enter.</li>
        <li><strong>Payslip figures:</strong> when you upload a payslip PDF we read it to pull out the pay period and amounts. The file is processed in memory and not stored; we keep only the extracted figures and the comparison result.</li>
        <li><strong>Roster sync:</strong> if you connect a Humanforce calendar feed, we store the feed link encrypted and the shifts it returns.</li>
        <li><strong>Technical logs:</strong> our servers keep short-lived request logs (such as IP address and time) to keep the service secure and to stop abuse.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to run the service for you: signing you in, showing your hours and earnings, syncing your roster and
        checking payslips. We don&apos;t sell your data, show ads or share it with advertisers.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        We don&apos;t use advertising or analytics cookies. Your sign-in token is kept in your browser&apos;s local
        storage so you stay signed in, and is removed when you sign out.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Data is held in a managed MongoDB database and our app is served by third-party hosting providers (Vercel
        and Render). Connections to the site and the API are encrypted with HTTPS.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You can edit or delete your time logs, employers and roster sync at any time inside the app.</li>
        <li>You can ask us for a copy of your data, or for your account and all its data to be deleted.</li>
      </ul>

      <h2>Changes</h2>
      <p>
        If we change this policy we&apos;ll update the date at the top of this page. Significant changes will be
        flagged in the app.
      </p>

      <h2>Contact</h2>
      <p>Questions about your data or a deletion request? Contact the Time Tracker team and we&apos;ll respond as soon as we can.</p>
    </LegalPage>
  );
}
