import { describe, expect, it } from 'vitest'
import { safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it('allows same-site paths', () => {
    expect(safeRedirect('/account')).toBe('/account')
    expect(safeRedirect('/account?tab=password')).toBe('/account?tab=password')
  })

  it('rejects anything that could leave the site', () => {
    expect(safeRedirect('https://evil.example')).toBe('/')
    expect(safeRedirect('//evil.example')).toBe('/')
    expect(safeRedirect('/\\evil.example')).toBe('/')
    expect(safeRedirect('javascript:alert(1)')).toBe('/')
  })

  it('falls back for missing values', () => {
    expect(safeRedirect(undefined)).toBe('/')
    expect(safeRedirect(undefined, '/login')).toBe('/login')
  })
})
