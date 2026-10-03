// Only follow same-site relative paths, so ?redirect=https://evil.example can't bounce users off-site
export function safeRedirect(target: unknown, fallback = '/'): string {
  if (typeof target !== 'string') return fallback
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback
  return target
}

// Absolute URL for links the server puts in emails / OAuth callbacks
export const appUrl = (path: string) => new URL(path, window.location.origin).toString()
