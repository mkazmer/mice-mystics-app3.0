import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { sessionQuery } from '@/lib/session'

// Guest-only pages: signed-in users are sent to the app
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery)
    if (session) throw redirect({ to: '/' })
  },
  component: Outlet,
})
