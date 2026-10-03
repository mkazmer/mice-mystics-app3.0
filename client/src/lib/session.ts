import { queryOptions, type QueryClient } from '@tanstack/react-query'
import { authClient } from './auth-client'

// The session lives in TanStack Query so route guards (beforeLoad) and components share one cache
export const sessionQuery = queryOptions({
  queryKey: ['session'],
  queryFn: async () => {
    const { data, error } = await authClient.getSession()
    if (error) throw new Error(error.message)
    return data // null when signed out
  },
  staleTime: 5 * 60 * 1000,
})

export type SessionData = typeof authClient.$Infer.Session

export const refreshSession = (queryClient: QueryClient) => queryClient.invalidateQueries(sessionQuery)

export const configQuery = queryOptions({
  queryKey: ['config'],
  queryFn: async (): Promise<{ googleEnabled: boolean }> => {
    const res = await fetch('/api/config')
    if (!res.ok) throw new Error('Could not load app config')
    return res.json()
  },
  staleTime: Infinity,
})
