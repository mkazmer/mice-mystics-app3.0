import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-svh items-center justify-center text-muted-foreground">Page not found</div>
  ),
})
