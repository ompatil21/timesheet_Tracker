# TimeTracker

A full-stack web application for freelancers and casual workers to log hours, verify payslips, and know exactly what they're owed — before every payment conversation.

---

## The Problem

Freelancers and casual employees often work across multiple clients, irregular hours, and varying pay rates — weekday, weekend, supervisor, and public holiday. Tracking what you're actually owed vs. what your employer reports is tedious, and discrepancies are easy to miss until it's too late.

**TimeTracker solves this** by giving you a single place to log every shift as you work, automatically calculate your earnings using your exact pay rates, and compare the total against your payslip when it arrives.

---

## What It Does

### Time Logging
Log shifts with start time, finish time, and break duration. The app calculates net hours and applies the correct rate automatically — ordinary, casual loading, supervisor, Saturday, Sunday, or public holiday.

### Payslip Verification
Upload a payslip for any pay period and compare the employer's reported hours and amount against your tracked logs. Discrepancies surface immediately with a match / mismatch status.

### Earnings Dashboard
See total hours worked and total earnings for the current week, last week, or the full month — with animated counters, a daily hours breakdown chart, and a revenue-by-client donut chart.

### Client Management
Add multiple employers, each with their own ordinary rate, casual loading percentage, supervisor rate, and weekend/holiday penalty rates. All earnings calculations use these rates automatically.

### Timesheet History
Browse and manage every logged shift. Filter by period, edit entries, and delete mistakes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| Security | Helmet, CORS, Rate Limiting, Mongo Sanitize |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 1. Clone the repo

```bash
git clone https://github.com/ompatil21/timesheet_Tracker.git
cd timesheet_Tracker
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env   # fill in your MONGO_URI and JWT_SECRET
npm install
npm run dev            # runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev                  # runs on http://localhost:3000
```

### 4. Seed sample data (optional)

Populates the database with a demo user and a full month of realistic shifts:

```bash
cd backend
node seed.js
```

Demo credentials after seeding:
- **Email:** `ompatilcodes@gmail.com`
- **Password:** `Password@123`

---

## Key Features at a Glance

- Shift logging with start/finish times and break duration
- Automatic earnings calculation (ordinary, casual loading, supervisor, Sat/Sun/holiday rates)
- Payslip upload and period-by-period verification
- Dashboard with weekly/monthly earnings charts
- Multi-client support with independent pay rates
- Dark-first UI with Framer Motion animations
- JWT authentication with secure password hashing

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of the folder structure, MVC pattern, and security measures implemented across the stack.

---

## License

MIT
