import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Logo } from '@/components/Logo'
import { UserMenu } from '@/components/UserMenu'
import { sessionQuery } from '@/lib/session'

// Signed-in pages: everyone else goes to /login and comes back afterwards
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery)
    if (!session) throw redirect({ to: '/login', search: { redirect: location.href } })
  },
  component: AppLayout,
})

function AppLayout() {
  const { data: session } = useSuspenseQuery(sessionQuery)
  if (!session) return null // signing out: the menu navigates to /login

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo />
          <UserMenu user={session.user} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
