import { ImageResponse } from 'next/og';

// Social preview card (1200x630) shown when the site link is shared.
export const runtime = 'edge';
export const alt = 'Time Tracker: your time, your invoice. Log hours and check your payslip.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#1F1B16';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F1EADB',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: 940,
            padding: '56px 72px',
            background: '#CFA77F',
            border: `4px solid ${INK}`,
            borderRadius: 12,
            transform: 'rotate(-1.5deg)',
            color: INK,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -26,
              left: 300,
              width: 260,
              height: 52,
              background: '#E5A4C3',
              opacity: 0.9,
              transform: 'rotate(-3deg)',
            }}
          />
          <div style={{ fontSize: 34, letterSpacing: 6, textTransform: 'uppercase' }}>Time Tracker</div>
          <div style={{ fontSize: 100, fontWeight: 700, lineHeight: 1, marginTop: 24 }}>Your time,</div>
          <div style={{ fontSize: 100, fontWeight: 700, lineHeight: 1 }}>your invoice.</div>
          <div style={{ fontSize: 34, marginTop: 28, maxWidth: 760, lineHeight: 1.35 }}>
            Log your hours, check every payslip, and catch underpayments early.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
