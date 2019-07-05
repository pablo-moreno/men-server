import jwt from 'jsonwebtoken'
import mongoose from '../../mongoose'
import Group from './Group'
import Permission from './Permission'
import { JWT_SECRET, EXPIRATION_DAYS } from '../../config'
import { hashPassword, validatePassword } from '../../utils'
import { BadRequestException, NotFoundException } from '../../exceptions'

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    index: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  token: {
    type: String,
    required: false,
    index: true
  },
  creationDate: {
    type: Date,
    required: false,
    default: () => Date.now()
  },
  active: {
    type: Boolean,
    default: () => true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    required: false
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  incomingFriendshipRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FriendshipRequet',
    required: true
  }],
  avatar: {
    type: String,
    required: false,
  },
})

UserSchema.path('email').validate(
  email => /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email), 
  'The e-mail is not correct.'
)

UserSchema.methods.generateAuthToken = async function () {
  let user = this
  let token = jwt.sign({ 
    _id: user._id.toHexString(), 
    email: user.email
  }, JWT_SECRET).toString()
  user.token = token
  
  return user.save()
}

UserSchema.methods.removeToken = async function (token) {
  return this.update({ token: '' })
}

UserSchema.methods.getPermissions = async function () {
  return []
}

UserSchema.methods.hasPermission = async function (permission) {
  const groups = await Group.find({ _id: { $in: this.groups } })
  const perm = await Permission.find({ name: permission })
  const permissions = []
  groups.forEach(group => {
    group.permissions.forEach(permission => {
      permissions.push(permission)
    })
  })
  return permissions.indexOf(perm._id) > -1
}

UserSchema.methods.verify = (verificationToken) => {
  const { _id, expirationDate } = jwt.verify(verificationToken, JWT_SECRET)
  const expired = Date.now().valueOf() > expirationDate
  if (! expired && this._id === _id) {
    this.verified = true
    this.save()
    return true
  }
  return false
}

UserSchema.methods.createVerificationToken = () => {
  const expirationDate = new Date()
  expirationDate.setDate(date.getDate() + EXPIRATION_DAYS)

  const token = jwt.sign({ 
    _id: this._id.toHexString(), 
    expirationDate
  }, JWT_SECRET).toString()
  this.verificationToken = token
  this.save()
  return this.verificationToken
}

UserSchema.statics.findByToken = async function (token) {
  let user = this
  let decoded = jwt.verify(token, JWT_SECRET)

  return user.findOne({
    '_id': decoded._id,
    'token': token,
  })
}

UserSchema.statics.findByUsername = async function (username) {
  return this.find({ username: { $regex: `${username}.*` } })
}

UserSchema.statics.createUser = async function({ username, password, email, firstName = '', lastName = '' }) {
  const hashedPassword = await hashPassword(password)

  let user = new User({ 
    username,
    email,
    firstName,
    lastName,
    password: hashedPassword,
    token: ''
  })
  return user.save()
}

UserSchema.statics.authenticate = async function (email, password) {
  const user = await User.findOne({ email })
  if (! user) throw new NotFoundException('User not found')
  
  const isValid = await validatePassword(password, user.password)

  if (!isValid) throw new BadRequestException('Wrong username or password')
  if (user.token === '') user.generateAuthToken()  

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    token: user.token,
    firstName: user.firstName,
    lastName: user.lastName
  }
}

const User = mongoose.model('User', UserSchema)

export default User
