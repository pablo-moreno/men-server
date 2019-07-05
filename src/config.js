import { config } from 'dotenv'

config()

export const { 
  HOST, 
  PORT, 
  DB_URL, 
  JWT_SECRET,
  REDIS_HOST,
  REDIS_PORT,
  SECRET_KEY, 
  UPLOADS_PATH, 
  UPLOADS_URL,
  SENTRY_URL,
} = process.env

export const SALT = parseInt(process.env.SALT)
export const DEBUG = process.env.NODE_ENV !== 'production'
export const EXPIRATION_DAYS = 7
export const PAGE_SIZE = 20
