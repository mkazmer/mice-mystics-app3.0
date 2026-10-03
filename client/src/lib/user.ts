export function initials(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)
  return letters.toUpperCase()
}
