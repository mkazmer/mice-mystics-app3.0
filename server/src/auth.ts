import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { resetPasswordTemplate, verifyEmailTemplate } from './email/templates.js'
import { sendEmail } from './email/mailer.js'
import { env, googleEnabled } from './env.js'
import { db } from './lib/db.js'

export const auth = betterAuth({
  appName: 'Mice & Mystics',
  // The client proxies /api to this server, so every auth URL (email links, OAuth callbacks) lives on APP_URL
  baseURL: env.APP_URL,
  basePath: '/api/auth',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.APP_URL],
  database: prismaAdapter(db, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(resetPasswordTemplate({ to: user.email, name: user.name, url }))
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true, // signing in unverified re-sends the link
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(verifyEmailTemplate({ to: user.email, name: user.name, url }))
    },
  },

  socialProviders: googleEnabled
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
          prompt: 'select_account',
        },
      }
    : {},

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh expiry at most once a day while active
  },

  // Failed OAuth flows land back on the login page with ?error=...
  onAPIError: { errorURL: `${env.APP_URL}/login` },

  telemetry: { enabled: false },
})

export type Session = typeof auth.$Infer.Session
