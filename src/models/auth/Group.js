import mongoose from '../../mongoose'

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    required: false,
    trim: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  creationDate: {
    type: Date,
    default: () => Date.now()
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
})

GroupSchema.methods.addMember = function(user) {
  if (this.members.indexOf(user) > -1) {
    throw new Error('Groups: User is already a member')
  } else {
    this.members.push(user)
  }
}

const Group = mongoose.model('Group', GroupSchema)

export default Group
