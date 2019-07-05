import mongoose from '../../mongoose'

const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    required: false,
    trim: true
  },
})

const Permission = mongoose.model('Permission', PermissionSchema)

export default Permission
