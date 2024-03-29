// TS treats modules as scripts without this dummy import
import {} from './index'

module.exports = {
  user: require('./user'),
  portfolio: require('./portfolio'),
  project: require('./project'),
  task: require('./task'),
  privileges: require('./privileges'),
  privilegesCategories: require('./privilegesCategories'),
  itemsList: require('./itemsList'),
  login: require('./login'),
  signup: require('./signup'),
  logout: require('./logout'),
  checkAuth: require('./checkAuth'),
  oauth: require('./oauth'),
  verifyEmail: require('./verifyEmail'),
  connection: require('./connection'),
  db: require('./db'),
  media: require('./media')
}
