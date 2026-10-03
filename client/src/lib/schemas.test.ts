import { describe, expect, it } from 'vitest'
import { changePasswordSchema, signupSchema } from './schemas'

const valid = {
  name: 'Player One',
  email: 'p@example.com',
  password: 'supersecret',
  confirmPassword: 'supersecret',
}

describe('signupSchema', () => {
  it('accepts a valid sign-up', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('reports mismatched passwords on the confirm field', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['confirmPassword'])
  })

  it('rejects short passwords and bad emails', () => {
    const result = signupSchema.safeParse({
      ...valid,
      email: 'nope',
      password: 'short',
      confirmPassword: 'short',
    })
    const fields = result.error?.issues.map(i => i.path[0])
    expect(fields).toEqual(expect.arrayContaining(['email', 'password']))
  })
})

describe('changePasswordSchema', () => {
  it('requires the current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      password: 'newsecret1',
      confirmPassword: 'newsecret1',
    })
    expect(result.error?.issues[0].path).toEqual(['currentPassword'])
  })
})
