import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className="flex items-center">
      <img src="/logo.png" alt="Mice & Mystics" className={cn('h-10 w-auto', className)} />
    </Link>
  )
}
