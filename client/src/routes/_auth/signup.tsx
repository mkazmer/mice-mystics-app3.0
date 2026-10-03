import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthShell } from '@/components/AuthShell'
import { FormError } from '@/components/FormError'
import { FormField } from '@/components/FormField'
import { GoogleButton } from '@/components/GoogleButton'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { appUrl, safeRedirect } from '@/lib/redirect'
import { signupSchema } from '@/lib/schemas'

export const Route = createFileRoute('/_auth/signup')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: Signup,
})

function Signup() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async ({ name, email, password }) => {
    setFormError(null)
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      // Where the verification link sends them once confirmed (signed in automatically)
      callbackURL: appUrl(safeRedirect(search.redirect)),
    })
    if (error) {
      setFormError(error.message ?? 'Could not create your account')
      return
    }
    await navigate({ to: '/check-email', search: { email } })
  })

  return (
    <AuthShell
      title="Create an account"
      description="Save your campaigns and pick up where you left off"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            search={{ redirect: search.redirect }}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Log in
          </Link>
        </>
      }
    >
      <GoogleButton redirectTo={safeRedirect(search.redirect)} />
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <FormError>{formError}</FormError>
        <FormField label="Name" autoComplete="name" error={errors.name} {...form.register('name')} />
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
          autoComplete="new-password"
          error={errors.password}
          {...form.register('password')}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
