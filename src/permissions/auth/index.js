import Group from '../../models/auth/Group'

const isAdmin = async (user) => {
  const { groups } = user
  const admin = await Group.findOne({ name: 'admin' })
  return groups.indexOf(admin._id) > -1
}

export const canCreateGroup = async (req, res) => {
  const { user } = req
  return isAdmin(user)
}
