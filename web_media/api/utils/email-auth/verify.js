import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer'

export const generateOTP = () => {
  return crypto.randomBytes(3).toString("hex");
};

export const sendVerifyEmail = (email, emailToken) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "halo051102@gmail.com",
      pass: "ynck wnna wvdm cnmt",
    },
  });

  const mailOptions = {
    from: 'halo051102@gmail.com',
    to: email,
    subject: "Xác thực email",
    html: `<a href='http://localhost:3000/verify?emailToken=${emailToken}'>NHẤN VÀO ĐÂY ĐỂ XÁC THỰC</a>
    `,
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