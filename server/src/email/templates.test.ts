import { describe, expect, it } from 'vitest'
import { resetPasswordTemplate, verifyEmailTemplate } from './templates.js'

const url = 'http://localhost:5173/api/auth/verify-email?token=abc'

describe('email templates', () => {
  it('includes the link in both the HTML and plain-text versions', () => {
    const email = verifyEmailTemplate({ to: 'p@example.com', name: 'Player', url })
    expect(email.to).toBe('p@example.com')
    expect(email.html).toContain(`href="${url}"`)
    expect(email.text).toContain(url)
  })

  it('escapes user-controlled names in HTML', () => {
    const email = resetPasswordTemplate({ to: 'p@example.com', name: '<img src=x onerror=alert(1)>', url })
    expect(email.html).not.toContain('<img src=x')
    expect(email.html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })
})
