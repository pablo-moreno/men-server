import express from 'express'
import cors from 'cors'
import session from 'express-session'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import multer from 'multer'
import connectRedis from 'connect-redis'
import redisClient from './redisClient'
import { DEBUG, SECRET_KEY, UPLOADS_PATH, REDIS_HOST, REDIS_PORT } from './config'
import { authenticationRequired, checkPermissions, logger, onError } from './middleware'
import { errorWrapper as e } from './utils'
import { login, createUser, getMe, updateUser, uploadAvatar, createGroup, searchUsers } from './controllers/auth'
import Raven from 'raven'
import { SENTRY_URL } from './config'

const server = express()

if (process.env.NODE_ENV === 'production') {
  Raven.config(SENTRY_URL).install()
  server.use(Raven.errorHandler())
}

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(compression())
server.use(express.static('media'))
server.use(onError)

const redisStore = connectRedis(session)
let sessionConf = {
  store: new redisStore({ 
    host: REDIS_HOST, 
    port: REDIS_PORT, 
    client: redisClient
  }),
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: true
}

if (DEBUG) {
  server.use(cors())
} else {
  server.use(helmet())
  server.set('trust proxy', 1)
  sessionConf.secure = true
}
server.use(session(sessionConf))

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, UPLOADS_PATH)
  },
  filename(req, file, callback) {
    const [extension] = file.originalname.split('.').slice(-1)
    callback(null, `${Date.now()}.${extension}`)
  }
})
const upload = multer({ storage })

/**
 * @api {post} /auth/login User login
 * @apiName Authenticate user
 * @apiGroup Authentication
 * 
 * @apiParam {String}     email                   User's email
 * @apiParam {String}     password                User's password
 * 
 * @apiSuccess {String}     id                User's Id
 * @apiSuccess {String}     username          User's username
 * @apiSuccess {String}     email             User's email
 * @apiSuccess {String}     token             User's token
 * @apiSuccess {String}     firstName         User's first name
 * @apiSuccess {String}     lastName          User's last name
 */
server.post('/auth/login', logger, checkPermissions([]), e(login))

/**
 * @api {post} /auth/sign-up User registration
 * @apiName Create new user
 * @apiGroup Authentication
 * 
 * @apiParam   {String}     username          User's username
 * @apiParam   {String}     password          User's password
 * @apiParam   {String}     password2         Repeat password
 * @apiParam   {String}     email             User's email
 * @apiParam   {String}     firstName         User's first name
 * @apiParam   {String}     lastName          User's last name
 * 
 * @apiSuccess {String}     id                User's Id
 * @apiSuccess {String}     username          User's username
 * @apiSuccess {String}     email             User's email
 * @apiSuccess {String}     token             User's token
 * @apiSuccess {String}     firstName         User's first name
 * @apiSuccess {String}     lastName          User's last name
 */
server.post('/auth/sign-up', logger, checkPermissions([]), e(createUser))

/**
 * @api {post} /auth/me Get User data
 * @apiName Get user info
 * @apiGroup Authentication
 * 
 * @apiHeader  {String}     x-auth            User token
 * 
 * @apiSuccess {String}     id                User's Id
 * @apiSuccess {String}     username          User's username
 * @apiSuccess {String}     email             User's email
 * @apiSuccess {String}     token             User's token
 * @apiSuccess {String}     firstName         User's first name
 * @apiSuccess {String}     lastName          User's last name
 */
server.get('/auth/me', logger, authenticationRequired, checkPermissions([]), e(getMe))

/**
 * @api {put} /auth/me User update
 * @apiName Update user
 * @apiGroup Authentication
 * 
 * @apiHeader  {String}     x-auth                  User token
 * 
 * @apiParam   {String}     username          User's username
 * @apiParam   {String}     email             User's email
 * @apiParam   {String}     firstName         User's first name
 * @apiParam   {String}     lastName          User's last name
 * 
 * @apiSuccess {Number}     n                 Affected users
 * @apiSuccess {Number}     nModified         Modified users
 * @apiSuccess {Boolean}    ok                Updated ok?
 */
server.put('/auth/me', logger, authenticationRequired, checkPermissions([]), e(updateUser))

/**
 * @api {post} /auth/me/avatar Upload user avatar
 * @apiName Upload user avatar
 * @apiGroup Authentication
 * 
 * @apiHeader  {String}     x-auth            User token
 * 
 * @apiParam   {File}       avatar            Image file
 * 
 * @apiSuccess {String}     avatar            Image url
 */
server.post('/auth/me/avatar', logger, authenticationRequired, checkPermissions([]), upload.single('avatar'), e(uploadAvatar))

/**
 * @api {post} /auth/me/avatar Upload user avatar
 * @apiName Upload user avatar
 * @apiGroup Authentication
 * 
 * @apiHeader  {String}     x-auth            User token
 * 
 * @apiParam   {File}       avatar            Image file
 * 
 * @apiSuccess {String}     avatar            Image url
 */
server.post('/auth/groups/new', logger, authenticationRequired, checkPermissions([]), e(createGroup))

/**
 * @api {post} /users/ Search users
 * @apiName Search users
 * @apiGroup Users
 * 
 * @apiHeader {String}      x-auth          User token
 * 
 * @apiParam {String}       username        Username
 * 
 * @apiSuccess {String}     users._id               User's Id
 * @apiSuccess {String}     users.username          User's username
 */
server.get('/users', logger, authenticationRequired, checkPermissions([]), e(searchUsers))

export default server
