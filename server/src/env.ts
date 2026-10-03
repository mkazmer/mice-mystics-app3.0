import { z } from 'zod'

// Validate configuration once at startup so a missing variable fails loudly instead of at first use
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  APP_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment variables:\n' + z.prettifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data

export const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
