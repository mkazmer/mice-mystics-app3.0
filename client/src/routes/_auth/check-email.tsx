import { createFileRoute, Link } from '@tanstack/react-router'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthShell } from '@/components/AuthShell'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { appUrl } from '@/lib/redirect'

export const Route = createFileRoute('/_auth/check-email')({
  validateSearch: z.object({ email: z.string().optional() }),
  component: CheckEmail,
})

function CheckEmail() {
  const { email } = Route.useSearch()
  const [sending, setSending] = useState(false)

  const resend = async () => {
    if (!email) return
    setSending(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: appUrl('/') })
    setSending(false)
    if (error) toast.error(error.message ?? 'Could not resend the email')
    else toast.success('Verification email sent')
  }

  return (
    <AuthShell
      title="Check your email"
      description={
        <>
          We sent a verification link to{' '}
          {email ? <strong className="text-foreground">{email}</strong> : 'your inbox'}. Click it to finish
          creating your account.
        </>
      }
      footer={
        <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to log in
        </Link>
      }
    >
      <MailCheck className="mx-auto size-12 text-muted-foreground" aria-hidden="true" />
      <p className="text-center text-sm text-muted-foreground">
        The link expires in 1 hour. Check your spam folder if you don't see it.
      </p>
      {email && (
        <Button variant="outline" onClick={resend} disabled={sending}>
          {sending ? 'Sending…' : 'Resend email'}
        </Button>
      )}
    </AuthShell>
  )
}
