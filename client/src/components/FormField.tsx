import { useId, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = ComponentProps<typeof Input> & {
  label: string
  error?: { message?: string }
  labelAside?: React.ReactNode
}

export function FormField({ label, error, labelAside, ...inputProps }: Props) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {labelAside}
      </div>
      <Input id={id} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...inputProps} />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  )
}
