import { zodResolver } from '@hookform/resolvers/zod'
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormError } from '@/components/FormError'
import { FormField } from '@/components/FormField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { appUrl } from '@/lib/redirect'
import { changePasswordSchema, profileSchema } from '@/lib/schemas'
import { configQuery, refreshSession, sessionQuery, type SessionData } from '@/lib/session'

const accountsQuery = queryOptions({
  queryKey: ['accounts'],
  queryFn: async () => {
    const { data, error } = await authClient.listAccounts()
    if (error) throw new Error(error.message)
    return data
  },
})

export const Route = createFileRoute('/_app/account')({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountsQuery),
  component: Account,
})

function Account() {
  const { data: session } = useSuspenseQuery(sessionQuery)
  const { data: accounts } = useSuspenseQuery(accountsQuery)
  if (!session) return null

  const hasPassword = accounts.some(a => a.providerId === 'credential')

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
        <p className="text-muted-foreground">Manage your profile and how you sign in.</p>
      </div>
      <ProfileCard user={session.user} />
      <SignInMethodsCard providers={accounts.map(a => a.providerId)} />
      {hasPassword ? <ChangePasswordCard /> : <SetPasswordCard email={session.user.email} />}
    </div>
  )
}

function ProfileCard({ user }: { user: SessionData['user'] }) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name } })
  const { errors, isSubmitting, isDirty } = form.formState

  const onSubmit = form.handleSubmit(async ({ name }) => {
    setFormError(null)
    const { error } = await authClient.updateUser({ name })
    if (error) {
      setFormError(error.message ?? 'Could not save')
      return
    }
    await refreshSession(queryClient)
    form.reset({ name })
    toast.success('Profile saved')
  })

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how other players will see you.</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-4">
          <FormError>{formError}</FormError>
          <FormField label="Name" autoComplete="name" error={errors.name} {...form.register('name')} />
          <div className="grid gap-2">
            <span className="text-sm font-medium">Email</span>
            <div className="flex items-center gap-2 text-sm">
              <span>{user.email}</span>
              {user.emailVerified ? (
                <Badge variant="secondary">Verified</Badge>
              ) : (
                <Badge variant="destructive">Unverified</Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-4 justify-end">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

const providerLabels: Record<string, string> = { credential: 'Email & password', google: 'Google' }

function SignInMethodsCard({ providers }: { providers: string[] }) {
  const { data: config } = useQuery(configQuery)
  const canLinkGoogle = config?.googleEnabled && !providers.includes('google')

  const linkGoogle = async () => {
    const { error } = await authClient.linkSocial({ provider: 'google', callbackURL: appUrl('/account') })
    if (error) toast.error(error.message ?? 'Could not link Google')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-in methods</CardTitle>
        <CardDescription>Ways you can log in to this account.</CardDescription>
      </CardHeader>
      <CardContent className="mt-4 flex flex-col gap-3">
        {providers.map(p => (
          <div key={p} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{providerLabels[p] ?? p}</span>
            <Badge variant="secondary">Connected</Badge>
          </div>
        ))}
        {canLinkGoogle && (
          <Button variant="outline" className="self-start" onClick={linkGoogle}>
            Connect Google
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function ChangePasswordCard() {
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async ({ currentPassword, password }) => {
    setFormError(null)
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword: password,
      revokeOtherSessions: true,
    })
    if (error) {
      setFormError(error.message ?? 'Could not change your password')
      return
    }
    form.reset()
    toast.success('Password changed. Other devices have been signed out.')
  })

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Changing your password signs you out on other devices.</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-4">
          <FormError>{formError}</FormError>
          <FormField
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword}
            {...form.register('currentPassword')}
          />
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
        </CardContent>
        <CardFooter className="mt-4 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Change password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

// Google-only accounts have no password yet; the reset email lets them create one
function SetPasswordCard({ email }: { email: string }) {
  const [sending, setSending] = useState(false)

  const send = async () => {
    setSending(true)
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: appUrl('/reset-password') })
    setSending(false)
    if (error) toast.error(error.message ?? 'Could not send the email')
    else toast.success(`We sent a link to ${email}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          You sign in with Google. Add a password to also log in with your email.
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-4">
        <Button variant="outline" onClick={send} disabled={sending}>
          {sending ? 'Sending…' : 'Email me a link to set a password'}
        </Button>
      </CardFooter>
    </Card>
  )
}
