import { z } from 'zod'

const email = z.email('Enter a valid email address')
const newPassword = z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters')

// Attach the mismatch error to the confirm field so it shows under that input
const passwordsMatch = (d: { password: string; confirmPassword: string }) => d.password === d.confirmPassword
const mismatch = { message: "Passwords don't match", path: ['confirmPassword'] }

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your name').max(50),
    email,
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, mismatch)

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({ password: newPassword, confirmPassword: z.string() })
  .refine(passwordsMatch, mismatch)

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(50),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, mismatch)
