import nodemailer from 'nodemailer'
import { env } from '../env.js'

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
})

export type Email = { to: string; subject: string; html: string; text: string }

export async function sendEmail(email: Email) {
  await transport.sendMail({ from: env.EMAIL_FROM, ...email })
}
