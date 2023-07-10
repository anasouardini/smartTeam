const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const os = require('os');
const MConnection = require('../models/connection');

// TS treats modules as scripts without this dummy import
import {} from './index'

const genLink = async (req, res) => {
  const privKey = await fs.readFile(
    `${process.cwd()}/rsa/verifyConnection/key.pem`,
    { encoding: 'utf8' }
  );
  const jwtOptions = { algorithm: 'RS256' };
  const token = jwt.sign({ userID: req.userID }, privKey, jwtOptions);

  const hostname = req.headers.host;
  const link = `${hostname}/verifyConnection/${token}`;

  res.json({ data: link });
};

const verify = async (req, res, next) => {
  const pubKey = await fs.readFile(
    process.cwd() + '/rsa/verifyConnection/key.pub',
    {
      encoding: 'utf-8',
    }
  );

  let tokenData;
  try {
    tokenData = jwt.verify(req.params.token, pubKey);
  } catch (e) {
    console.log(e);
    res.json({ error: 'this link is not valid.' });
  }

  if(req.userID == tokenData.userID){
    return res.status(403).json({data: 'You can\'t invite yourself to be a connection of yours.'})
  }

  const resp = await MConnection.create({inviter: tokenData.userID, newConnection: req.userID});
  if(resp.err){
    return next('Err while verifying connection.')
  }

  return res.json({ data: 'Connection was verified successfully.' });
};



module.exports = { genLink, verify };
