import mongoose from 'mongoose'
import { DB_URL } from './config'

const mongooseConfig = { 
  useNewUrlParser: true, 
  useCreateIndex: true
}

mongoose.connect(DB_URL, mongooseConfig)
mongoose.Promise = global.Promise

export default mongoose
