# Timesheet Tracker Architecture & Security

This document outlines the architectural decisions, folder structures, and security posture for the Timesheet Tracker application.

## 1. System Architecture

The application is built using a decoupled **Client-Server architecture**, consisting of a Next.js frontend and a Node.js/Express backend. This allows for separation of concerns, independent scaling, and a secure backend environment that does not expose database credentials to the client.

### Technology Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript.
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **Authentication**: JSON Web Tokens (JWT) with bcrypt password hashing.
- **Data Storage**: MongoDB Atlas.

---

## 2. Folder Structure

### Frontend (`/frontend`)
The frontend follows a feature-based and modular architecture within the Next.js App Router paradigm.

```text
frontend/
├── src/
│   ├── app/              # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/       # Authentication routes (Login, Register)
│   │   ├── dashboard/    # Dashboard view
│   │   ├── timesheet/    # Timesheet logging and history
│   │   ├── payslip/      # Payslip upload and validation
│   │   └── profile/      # Client and rate settings
│   ├── components/       # Reusable UI components (Buttons, Inputs, Cards)
│   ├── context/          # React Context (e.g., AuthProvider)
│   ├── hooks/            # Custom React Hooks
│   ├── lib/              # Utility functions and API client (Axios config)
│   └── types/            # TypeScript interfaces and types
```

### Backend (`/backend`)
The backend follows the **Model-View-Controller (MVC)** pattern (without the "View" since it's an API), emphasizing separation of routing, business logic, and data access.

```text
backend/
├── src/
│   ├── config/           # Environment variables and DB connection logic
│   ├── controllers/      # Request handlers (processes input, calls services)
│   ├── middleware/       # Custom middleware (Auth Guard, Error Handler)
│   ├── models/           # Mongoose schemas (User, Client, TimeLog, Payslip)
│   ├── routes/           # Express route definitions
│   ├── services/         # Core business logic (PDF parsing, Pay calculations)
│   └── utils/            # Helper functions (JWT signing, hashing)
├── .env                  # Secrets and configuration
└── server.js             # Entry point
```

---

## 3. Security (Paramount Focus)

Security is deeply integrated into both the frontend and backend to protect user data, passwords, and sensitive financial information.

### 3.1 Backend Security Measures
- **Password Hashing**: User passwords are encrypted using `bcryptjs` before being stored in MongoDB. Plaintext passwords never touch the database.
- **JWT Authentication**: The API is stateless. Upon login, a signed JWT is issued. All protected routes require a valid JWT in the `Authorization: Bearer <token>` header.
- **Helmet**: The `helmet` package is used to set secure HTTP headers, protecting against cross-site scripting (XSS), clickjacking, and other common attacks.
- **CORS strictness**: Cross-Origin Resource Sharing (CORS) is configured to only allow requests from the frontend's specific origin, preventing malicious sites from making API calls on the user's behalf.
- **Rate Limiting**: `express-rate-limit` is applied to authentication routes to mitigate brute-force password guessing attacks.
- **NoSQL Injection Prevention**: `express-mongo-sanitize` is used to strip out any malicious `$`, `.` or other MongoDB operator characters from incoming requests.
- **Input Validation**: All incoming request bodies are validated (e.g., ensuring hours are numbers, dates are valid) before processing.

### 3.2 Frontend Security Measures
- **XSS Prevention**: React automatically escapes variables in JSX, preventing Cross-Site Scripting. We strictly avoid using `dangerouslySetInnerHTML`.
- **Protected Routes**: Next.js middleware and React Auth Context ensure that unauthenticated users are immediately redirected to the login page.
- **Token Handling**: The JWT is stored securely in memory or `localStorage`.
- **TypeScript**: Strict typing prevents unexpected data structures and runtime errors that could be exploited.
