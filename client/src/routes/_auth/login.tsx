import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthShell } from '@/components/AuthShell'
import { FormError } from '@/components/FormError'
import { FormField } from '@/components/FormField'
import { GoogleButton } from '@/components/GoogleButton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { safeRedirect } from '@/lib/redirect'
import { loginSchema } from '@/lib/schemas'
import { refreshSession } from '@/lib/session'

// ?error=... comes from failed Google sign-ins (Better Auth's errorURL)
const oauthErrors: Record<string, string> = {
  account_not_linked:
    'An account with this email already exists. Log in with your password, then link Google from account settings.',
  access_denied: 'Google sign-in was cancelled.',
}

export const Route = createFileRoute('/_auth/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
    error: z.string().optional(),
  }),
  component: Login,
})

function Login() {
  const search = Route.useSearch()
  const redirectTo = safeRedirect(search.redirect)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(
    search.error ? (oauthErrors[search.error] ?? 'Sign-in failed. Please try again.') : null,
  )
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async values => {
    setFormError(null)
    setUnverifiedEmail(null)
    const { error } = await authClient.signIn.email(values)

    if (error?.code === 'EMAIL_NOT_VERIFIED') {
      // The server re-sends the verification link on every unverified sign-in attempt
      setUnverifiedEmail(values.email)
      return
    }
    if (error) {
      setFormError(error.message ?? 'Could not sign in')
      return
    }
    await refreshSession(queryClient)
    await navigate({ to: redirectTo })
  })

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your Mice & Mystics account"
      footer={
        <>
          Don't have an account?{' '}
          <Link
            to="/signup"
            search={{ redirect: search.redirect }}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </>
      }
    >
      <GoogleButton redirectTo={redirectTo} />
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        {unverifiedEmail && (
          <Alert>
            <MailCheck />
            <AlertDescription>
              Please verify your email first. We just sent a new link to <strong>{unverifiedEmail}</strong>.
            </AlertDescription>
          </Alert>
        )}
        <FormError>{formError}</FormError>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...form.register('email')}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
          labelAside={
            <Link
              to="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
          {...form.register('password')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  )
}
