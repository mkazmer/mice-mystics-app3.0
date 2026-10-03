import { describe, expect, it } from 'vitest'
import { initials } from './user'

describe('initials', () => {
  it('uses first letters of the first two names', () => {
    expect(initials('Player One', 'p@example.com')).toBe('PO')
  })

  it('handles single names and missing names', () => {
    expect(initials('Filch', 'f@example.com')).toBe('FI')
    expect(initials('', 'nez.bigsby@example.com')).toBe('NB')
  })
})
