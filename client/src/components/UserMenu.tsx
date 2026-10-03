import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { KeyRound, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { appUrl } from '@/lib/redirect'
import type { SessionData } from '@/lib/session'
import { initials } from '@/lib/user'

export function UserMenu({ user }: { user: SessionData['user'] }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const sendResetEmail = async () => {
    const { error } = await authClient.requestPasswordReset({
      email: user.email,
      redirectTo: appUrl('/reset-password'),
    })
    if (error) toast.error(error.message ?? 'Could not send the reset email')
    else toast.success(`Password reset link sent to ${user.email}`)
  }

  const signOut = async () => {
    await authClient.signOut()
    queryClient.clear() // drop every cached query so the next user can't see this one's data
    await navigate({ to: '/login' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open user menu">
          <Avatar>
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-medium text-foreground">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account">
            <Settings />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={sendResetEmail}>
          <KeyRound />
          Reset password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
