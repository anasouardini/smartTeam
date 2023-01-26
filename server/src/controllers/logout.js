require('dotenv').config();

const logout = async (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME);
  res.json({ data: 'you logged out', redirect: '/login' });

  return true;
};

module.exports = logout;
