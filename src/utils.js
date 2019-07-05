import { hash, compare } from 'bcryptjs'
import { SALT } from './config'

export const hashPassword = async password => hash(password, SALT)

export const validatePassword = async (password, hashedPassword) => compare(password, hashedPassword)

export const paginate = (array, size, page) => {
  if (page <= 0) return []
  return array.slice((page - 1) * size, page * size);
}

export const clean = obj => {
  const nObj = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      nObj[key] = obj[key]
    }
  })
  return nObj
}

export const errorWrapper = fn => {
  return async (req, res, next) => {
    fn(req, res, next).catch (next)
  }
}
