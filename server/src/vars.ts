require('dotenv').config();
// TS treats modules as scripts without this dummy import
import {} from './index'

let serverAddress = ''; // the first middle ware sets this up
let clientAddress = process.env.PRODUCTION ? 'https://smartteam.anasouardini.online' : 'http://127.0.0.1:3000';
module.exports = {serverAddress, clientAddress}
