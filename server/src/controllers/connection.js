const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const os = require('os');
const MConnection = require('../models/connection');

const genLink = async (req, res) => {
  const privKey = await fs.readFile(
    `${process.cwd()}/rsa/verifyConnection/key.pem`,
    { encoding: 'utf8' }
  );
  const jwtOptions = { algorithm: 'RS256' };
  const token = jwt.sign({ userID: req.userID }, privKey, jwtOptions);
  const hostname =
    process.env.PRODUCTION == 1 ? req.hostname : process.env.DEV_SERVER_ADDRESS;
  const link = `${hostname}/verifyConnection/${token}`;

  res.json({ data: link });
};

const verify = async (req, res) => {
  console.log('lskdjflj')
  const pubKey = await fs.readFile(
    process.cwd() + '/rsa/verifyConnection/key.pub',
    {
      encoding: 'utf-8',
    }
  );

  try {
    const tokenData = jwt.verify(req.params.token, pubKey);
    MConnection.create({inviter: tokenData.userID, newConnection: req.userID});
  } catch (e) {
    console.log(e);
    res.json({ error: 'this link is not valid.' });
  }

  return res.json({ data: 'Connection was verified successfully.' });
};

module.exports = { genLink, verify };
