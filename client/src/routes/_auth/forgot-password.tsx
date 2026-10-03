import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link } from '@tanstack/react-router'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AuthShell } from '@/components/AuthShell'
import { FormError } from '@/components/FormError'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { appUrl } from '@/lib/redirect'
import { forgotPasswordSchema } from '@/lib/schemas'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError(null)
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: appUrl('/reset-password') })
    if (error) setFormError(error.message ?? 'Something went wrong')
    else setSentTo(email)
  })

  const backToLogin = (
    <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
      Back to log in
    </Link>
  )

  if (sentTo) {
    return (
      <AuthShell title="Check your email" footer={backToLogin}>
        <MailCheck className="mx-auto size-12 text-muted-foreground" aria-hidden="true" />
        {/* Same message whether or not the account exists, so this page can't be used to discover accounts */}
        <p className="text-center text-sm text-muted-foreground">
          If an account exists for <strong className="text-foreground">{sentTo}</strong>, you'll get a link to
          reset your password. It expires in 1 hour.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link"
      footer={backToLogin}
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <FormError>{formError}</FormError>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...form.register('email')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthShell>
  )
}
