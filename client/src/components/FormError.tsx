import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
