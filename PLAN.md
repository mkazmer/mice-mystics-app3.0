# Mice & Mystics App 3.0 — Phase 1 Plan: Accounts + Backend Scaffolding

## Goal

A from-scratch, modern full-stack TypeScript app. Phase 1 delivers only accounts:

- Sign up with email + password, **email verification required** before first login
- **Continue with Google** (OAuth) as an alternative, already verified by Google
- Log in / log out, persistent sessions
- Forgot password → emailed reset link
- Logged-in home page: "Under construction" + user avatar menu (top right) with
  **Account settings**, **Reset password**, **Log out**
- Account settings page: edit display name, change password, see linked sign-in methods

Game features (dice, campaigns, heroes) come in later phases on top of this foundation.

## Lessons from 2.0 carried forward

- npm workspaces monorepo (`client/` + `server/`), one `npm run dev`
- Same-origin `/api` via Vite proxy → httpOnly cookies, no CORS
- Prisma 7 + Postgres in Docker, Zod validation, Express 5 async error handling
- Server-side sessions (revocable) rather than JWTs in localStorage

What changes: we don't hand-roll auth any more. Email verification, password reset and OAuth
are where homegrown auth gets security bugs (token expiry, timing leaks, account-linking
takeovers), so we use **Better Auth**, a maintained TypeScript auth library that keeps sessions
in our own database.

## Stack

| Layer        | Choice                                                                           | Why                                                                       |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Client build | Vite + React 19 + TypeScript                                                     | Fast, current standard                                                    |
| Routing      | TanStack Router (file-based)                                                     | Fully type-safe routes and search params, route-level auth guards         |
| Server state | TanStack Query                                                                   | Caching and mutations                                                     |
| Styling / UI | Tailwind CSS v4 + shadcn/ui (Radix)                                              | Accessible primitives (dropdown menu, forms), widely used in the industry |
| Forms        | React Hook Form + Zod                                                            | Typed validation, same schemas style as server                            |
| API          | Express 5 + TypeScript                                                           | Familiar, Better Auth has a first-class Node handler                      |
| Auth         | Better Auth (email/password, email verification, password reset, Google)         | Battle-tested flows, rate limiting, DB sessions                           |
| DB           | PostgreSQL 17 (Docker) + Prisma 7                                                | Typed queries, migrations                                                 |
| Email        | Nodemailer → **Mailpit** in dev (local inbox UI), any SMTP (e.g. Resend) in prod | Test real emails locally without sending them                             |
| Tests        | Vitest (client + server)                                                         | One runner everywhere                                                     |
| Lint/format  | oxlint + Prettier                                                                | Fast                                                                      |

## Architecture

```
mice-mystics-app3.0/
├── client/                  Vite React app
│   └── src/
│       ├── routes/          TanStack file routes
│       │   ├── __root.tsx
│       │   ├── _auth.tsx            layout for logged-out pages (redirects if signed in)
│       │   ├── _auth/login.tsx, signup.tsx, check-email.tsx,
│       │   │   forgot-password.tsx, reset-password.tsx
│       │   ├── _app.tsx             layout for signed-in pages (guard + header w/ user menu)
│       │   └── _app/index.tsx, account.tsx
│       ├── components/      ui/ (shadcn), UserMenu, GoogleButton, ...
│       └── lib/             auth-client.ts, query client, utils
├── server/
│   ├── prisma/schema.prisma User, Session, Account, Verification (Better Auth models)
│   └── src/
│       ├── auth.ts          Better Auth config
│       ├── email/           mailer + email templates
│       ├── routes/          app routes (e.g. /api/config, later game routes)
│       ├── app.ts, index.ts
├── docker-compose.yml       postgres (5433) + mailpit (SMTP 1025, UI 8025)
└── PLAN.md, README.md
```

Ports: client 5173, API 3001, Postgres **5433** (5432 is used by the 2.0 app's container), Mailpit UI 8025.

## Auth flows

1. **Sign up (email)** → `POST /api/auth/sign-up/email` → user created with `emailVerified=false`
   → verification email sent → client shows "Check your email" → link hits
   `/api/auth/verify-email?token=…` → verified, signed in automatically, redirected to the app.
   Logging in before verifying returns 403, and the login page offers "resend verification email".
2. **Google** → `signIn.social({ provider: 'google' })` → Google consent → callback
   `/api/auth/callback/google` → session cookie → app. Enabled only when
   `GOOGLE_CLIENT_ID/SECRET` are set; the client asks `GET /api/config` whether to show the button.
3. **Log out** → `POST /api/auth/sign-out` → session row deleted, cookie cleared.
4. **Forgot password** (logged out) → email → `/reset-password?token=…` → new password → all
   other sessions revoked → login.
5. **Reset password** (menu, logged in) → sends the same reset email to the user's own address.
   This also lets Google-only users add a password. Account settings additionally has an inline
   "change password" form (current + new) for users who already have one.
6. **Account settings** → update name, change password, list linked providers.

Security defaults: passwords ≥ 8 chars (hashed by Better Auth, scrypt), httpOnly SameSite=Lax
cookies, Better Auth's built-in rate limiting on auth endpoints, verification and reset tokens
expire (1h), and no user enumeration on forgot-password.

## Implementation steps

1. Root workspace, `.gitignore`, Prettier, `docker-compose.yml` (Postgres + Mailpit)
2. Server: Express 5 + TS, Prisma 7 with the pg adapter, Better Auth config, Better Auth schema → migration
3. Mailer (Nodemailer) + verification and reset email templates
4. `/api/config` + health route, error handling
5. Verify with curl + Mailpit: sign up → email → verify → session → sign out → reset password
6. Client: Vite + TS, Tailwind v4, shadcn/ui init, TanStack Router + Query, Better Auth React client
7. Pages: login, signup, check-email, forgot/reset password, home (under construction), account
8. Header + avatar `UserMenu` (dropdown: Account settings / Reset password / Log out)
9. Tests (Vitest) for key pieces, then lint, typecheck, build
10. README with setup, including how to create Google OAuth credentials

## Out of scope for phase 1

Deployment, account deletion, 2FA, avatar upload, game features.
