import { hashPassword, validatePassword } from '../utils'

describe('Password management', () => {
  it('Validate correct password', async () => {
    const mPassword = '1234'
    const hashedPassword = await hashPassword(mPassword)
    const result = await validatePassword(mPassword, hashedPassword)
    expect(result).toBe(true)
  })

  it('Wrong password', async () => {
    const mPassword = '1234'
    const hashedPassword = await hashPassword(mPassword)
    const result = await validatePassword('thisisnotthepassword', hashedPassword)
    expect(result).toBe(false)
  })
})
