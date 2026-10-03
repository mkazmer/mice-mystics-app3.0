import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from './Logo'

type Props = { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }

// Centered card used by every signed-out page (login, sign up, password reset, ...)
export function AuthShell({ title, description, children, footer }: Props) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted px-4 py-10">
      <Logo />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
      {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  )
}
