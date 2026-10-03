import { createFileRoute } from '@tanstack/react-router'
import { Construction } from 'lucide-react'

export const Route = createFileRoute('/_app/')({
  component: Home,
})

function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Construction className="size-12 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-3xl font-semibold tracking-tight">Under construction</h1>
      <p className="max-w-md text-muted-foreground">
        Campaign tracking, hero inventories and dice rolling are on the way.
      </p>
    </div>
  )
}
