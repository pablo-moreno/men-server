import { User } from '../../models/auth'
import { clean } from '../../utils'
import { UPLOADS_URL } from '../../config'
import { BadRequestException } from '../../exceptions'
import Permission from '../../models/auth/Permission'
import Group from '../../models/auth/Group'

export const createUser = async (req, res) => {
  const { username, password, password2, email, firstName, lastName } = req.body
  let response = {}
  if (password !== password2) throw new BadRequestException('Password mismatch')
  const user = await User.createUser({ username, password, email, firstName, lastName })
  response = {
    id: user._id,
    username: user.username, 
    email: user.email, 
    firstName: user.firstName, 
    lastName: user.lastName, 
    token: user.token
  }
  res.status(201).send(response)
}

export const login = async (req, res) => {
  const { email, password } = req.body
  let response = {}
  const user = await User.authenticate(email, password)
  response = user

  res.send(response)
}

export const getMe = async (req, res) => {
  res.send(req.user)
}

export const updateUser = async (req, res) => {
  const { _id } = req.user
  const user = req.body
  const updates = clean(user)

  const result = await User.updateOne({ _id }, { 
    $set: updates
  })
  res.send(result)
}

export const searchUsers = async (req, res) => {
  const { username } = req.query
  const results = await User.findByUsername(username)
  res.send(results.map(user => ({
      _id: user._id,
      username: user.username,
    })
  ))
}

export const createPermission = async (req, res) => {
  const { name } = req.body
  const permission = new Permission({ name })
  const result = await permission.save()
  res.send(result)
}

export const createGroup = async (req, res) => {
  const { name, permissions } = req.body
  const group = new Group({ name, permissions })
  const result = await group.save()
  res.send(result)
}

export const addUserGroup = async (req, res) => {
  const { user, group } = req.body
  const mUser = await User.findOne({ _id: user })
  const mGroup = await Group.findOne({ _id: group })
  mUser.groups.push(mGroup)
  const result = await mUser.save()
  res.send(result)
}

export const uploadAvatar = async (req, res) => {
  const { user, file } = req
  const mUser = await User.findOne({ _id: user._id })
  const path = `${UPLOADS_URL}/${file.filename}`
  mUser.avatar = path
  const results = await mUser.save()
  return res.send({
    avatar: results.avatar
  })
}
