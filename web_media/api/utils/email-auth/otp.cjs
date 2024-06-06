const crypto = require('crypto')
const nodemailer = require('nodemailer')
const { google } = require('googleapis');

const generateOTP = () => {
  return crypto.randomBytes(3).toString("hex");
};
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/gmail.send']
});

const sendOTP = (email, OTP) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "halo051102@gmail.com",
      pass: "...",
    },
  });

  const mailOptions = {
    from: 'halo051102@gmail.com',
    to: email,
    subject: "Your OTP",
    text: `Your OTP is: ${OTP}`,
  };

  // transporter.set("oauth2_provision_cb", (user, renew, callback) => {
  //   let accessToken = userTokens[user];
  //   if (!accessToken) {
  //     return callback(new Error("Unknown user"));
  //   } else {
  //     return callback(null, accessToken);
  //   }
  // });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { generateOTP, sendOTP }

