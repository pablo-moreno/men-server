import { User } from '../models/auth'
import { BadRequestException } from '../exceptions'
import pick from 'lodash/pick'

export const none = (req, res, next) => next()

export const authenticationRequired = async (req, res, next) => {
  let token = req.header('x-auth')
  
  try {
    const user = await User.findByToken(token)
    if (! user) {
      throw new BadRequestException('Invalid authentication credentials')
    }
    req.user = pick(user, '_id', 'username', 'email', 'token', 'firstName', 'lastName', 'groups')
    req.permissions = user.getPermissions()
    next()
  } catch (error) {
    res.status(401).send({
      status: 401,
      error: error.message
    })
  }
}

export const checkPermissions = (permissions) => {
  return async (req, res, next) => {
    const { user, params } = req
    if (permissions.length === 0) {
      next()
    } else {
      const results = []
      for (let permission of permissions) {
        const result = await permission(user, params)
        results.push(result)
      }
      const hasPermission = results && results.length === results.filter(i => i === true).length
      if (hasPermission) {
        next()
      } else {
        res.send({
          status: 403,
          error: 'Forbidden: You don\'t have permission to perform this action.'
        })
      }
    }
  }
}

export const logger = (req, res, next) => {
  console.log(`[${req.method}] - ${req.route.path} - ${JSON.stringify(req.body)}`)
  next()
}

export const onError = (err, req, res, next) => {
  res.status(500).send({
    status: 500,
    error: err.message
  })
}
