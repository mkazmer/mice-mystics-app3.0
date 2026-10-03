import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthShell } from '@/components/AuthShell'
import { FormError } from '@/components/FormError'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { resetPasswordSchema } from '@/lib/schemas'

// Not under the guest-only layout: the reset link from the user menu is opened while signed in
export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({
    token: z.string().optional(),
    error: z.string().optional(), // INVALID_TOKEN when the link is expired or already used
  }),
  component: ResetPassword,
})

function ResetPassword() {
  const { token, error: linkError } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const { errors, isSubmitting } = form.formState

  if (!token || linkError) {
    return (
      <AuthShell
        title="Link expired"
        description="This password reset link is invalid or has already been used."
        footer={
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Back to log in
          </Link>
        }
      >
        <Button asChild>
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </AuthShell>
    )
  }

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setFormError(null)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    if (error) {
      setFormError(error.message ?? 'Could not reset your password')
      return
    }
    // Resetting signs out every session (including this browser's), so start fresh
    queryClient.clear()
    toast.success('Password updated. Log in with your new password.')
    await navigate({ to: '/login' })
  })

  return (
    <AuthShell title="Choose a new password" description="You'll be signed out of all devices.">
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <FormError>{formError}</FormError>
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password}
          {...form.register('password')}
        />
        <FormField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  )
}
