# Mice & Mystics

A companion web app for the board game [Mice & Mystics](https://www.plaidhatgames.com/games/mice-and-mystics).
This is a ground-up rewrite on a modern TypeScript stack. **Phase 1** (this code) is accounts and the
backend foundation; game features (campaigns, hero inventories, dice rolling) come next. See [PLAN.md](PLAN.md).

## Features

- Sign up with email + password, with **email verification** before first login
- **Continue with Google** (optional; appears when credentials are configured)
- Log in / log out with persistent, revocable server-side sessions
- Forgot password → emailed reset link (resetting signs out every device)
- User menu: account settings, reset password, log out
- Account settings: edit name, change password, view/connect sign-in methods

## Tech stack

|                 |                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Client**      | React 19, TypeScript, Vite, TanStack Router (file-based, type-safe), TanStack Query, Tailwind CSS v4, shadcn/ui, React Hook Form + Zod |
| **Server**      | Node.js, Express 5, TypeScript, Better Auth, Nodemailer, Zod                                                                           |
| **Data**        | PostgreSQL 17, Prisma 7                                                                                                                |
| **Dev tooling** | npm workspaces, Docker Compose (Postgres + Mailpit), Vitest, oxlint, Prettier                                                          |

## Getting started

Requires Node 22+ and Docker.

```bash
npm install
cp server/.env.example server/.env
# then set BETTER_AUTH_SECRET in server/.env:  openssl rand -base64 32

npm run services:up   # Postgres (port 5433) + Mailpit
npm run db:migrate    # create tables + generate the Prisma client
npm run dev           # API on :3001, app on http://localhost:5173
```

**Emails in development:** nothing is really sent. Every email (verification, password reset) lands in
Mailpit at **http://localhost:8025**, so you can click the links from there.

| Script                                                 |                                 |
| ------------------------------------------------------ | ------------------------------- |
| `npm run dev`                                          | client + server with hot reload |
| `npm test`                                             | Vitest (server + client)        |
| `npm run lint` / `npm run typecheck` / `npm run build` |                                 |
| `npm run services:down`                                | stop Postgres + Mailpit         |

## Enabling Google sign-in

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
   and configure the OAuth consent screen (External, add yourself as a test user).
2. Create **OAuth client ID** → _Web application_.
   - Authorized JavaScript origin: `http://localhost:5173`
   - Authorized redirect URI: `http://localhost:5173/api/auth/callback/google`
3. Put the client ID and secret in `server/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and restart
   `npm run dev`. The "Continue with Google" button appears automatically.

## How it fits together

```
Browser ──► Vite (5173) ──/api/*──► Express (3001) ──► Better Auth ──► Postgres
                                         │
                                         └──► Nodemailer ──► Mailpit (dev) / SMTP (prod)
```

- **Same-origin API.** The client always calls `/api` on its own origin (Vite proxies it in dev), so the
  session cookie is a first-party `httpOnly`, `SameSite=Lax` cookie with no CORS. In production, keep
  this by serving the API behind the same domain or adding an `/api/*` rewrite on the static host.
- **Auth** is [Better Auth](https://www.better-auth.com), mounted at `/api/auth/*`. Its tables (`user`,
  `session`, `account`, `verification`) live in our own Postgres via Prisma. Passwords are hashed with
  scrypt, auth endpoints are rate limited, and requests from untrusted origins are rejected.
- **Route guards** run in TanStack Router's `beforeLoad`: `_app` routes require a session, `_auth`
  routes (login, sign up, ...) are guest-only. The session is cached in TanStack Query and shared by
  guards and components.
- **Custom API routes** use the `requireAuth` middleware (`server/src/lib/requireAuth.ts`). `/api/me`
  is the example; game routes will follow the same pattern.

## Project structure

```
client/src/
  routes/            file-based routes (_auth/* guest pages, _app/* signed-in pages)
  components/        AuthShell, FormField, GoogleButton, UserMenu, ui/ (shadcn)
  lib/               auth client, session query, zod schemas, helpers
server/
  prisma/            schema + migrations
  src/auth.ts        Better Auth configuration
  src/email/         mailer + HTML/text templates
  src/routes/        app routes (/api/config, /api/me, ...)
docker-compose.yml   Postgres + Mailpit
```

---

Created by Mike Kazmer · https://mikekazmer.com/
