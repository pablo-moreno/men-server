import { User } from '../../../models/auth'
import { hashPassword } from '../../../utils'

export const createMocks = async () => {
  const users = [
    {
      username: 'leia',
      email: 'leia@theresistance.com',
      password: await hashPassword('AllIWantIsHope')
    },
    {
      username: 'luke',
      email: 'luke@theresistance.com',
      password: await hashPassword('EveryWordYouSaidIsWrong'),
    },
    {
      username: 'han',
      email: 'han@theresistance.com',
      password: await hashPassword('IKnow'),
    },
  ]

  const results = []
  for (let user of users) {
    const u = new User(user)
    const result = await u.save()
    results.push(result)
  }

  return results
}

export const destroyMocks = async () => {
  return User.deleteMany({})
}