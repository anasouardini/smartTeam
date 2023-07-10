// TS treats modules as scripts without this dummy import
import {} from './index'

const nodemailer = require('nodemailer');

require('dotenv').config();

const mailer = async (targetEmail, message) => {
  const transporterOptions = {
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  }
  // console.log(transporterOptions)
  const transporter = nodemailer.createTransport(transporterOptions);

  const messgeConfig = {
    from: `"smartTeam" ${process.env.EMAIL_ADDRESS}`,
    to: targetEmail,
    subject: 'email verification',
    text: message,
  }

  try{
    const response = await transporter.sendMail(messgeConfig);
    // console.log(response);
  }catch(err){
    console.log(err);
  }
};

module.exports = mailer;
