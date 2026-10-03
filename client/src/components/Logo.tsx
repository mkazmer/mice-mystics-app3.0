import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <img src="/favicon.svg" alt="" className="size-7" />
      <span>Mice &amp; Mystics</span>
    </Link>
  )
}
