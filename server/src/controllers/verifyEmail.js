const MUser = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');

require('dotenv').config();

const verifyEmail = async (req, res) => {
  const token = req.params.token;
  const pubKey = await fs.readFile(process.cwd + '/rsa/emailVerification/key.pub', {
    encoding: 'utf-8',
  });

  try {
    const { username, email } = jwt.verify(token, pubKey);

    const readUserResponse = await MUser.read({ username, email });
    if (readUserResponse.err) {
      return next('error while verifying email');
    }
    if (!readUserResponse[0].length) {
      return res.status(400).json({
        error: 'there is no such username. or the username is not associated with the provided email.',
      });
    }

    const filter = { username, email };
    const newData = { verified: 1 };
    const updateUserResponse = await MUser.update(filter, newData);
    if (updateUserResponse.err) {
      return next('error while marking the account as verified.');
    }
    if (updateUserResponse[0].affectedRows == 0) {
      return next('error while marking the account as verified.');
    }

    return res.redirect(`${process.env.CLIENT_ADDRESS}/login`);
  } catch (e) {
    res.json({ error: 'the token you have sent is not valid.' });
  }
};

module.exports = verifyEmail;
