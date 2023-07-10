// TS treats modules as scripts without this dummy import
import {} from './index'

require('dotenv').config();

const logout = async (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME);
  res.json({ data: 'you logged out', redirect: '/login' });

  return true;
};

module.exports = logout;
