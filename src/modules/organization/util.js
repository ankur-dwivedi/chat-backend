const nodemailer = require("nodemailer");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const sendMail = async (otp, email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    //auth: {
    //  user: "cloudposgemailer@gmail.com",
    //  pass: "qa1ws23ed", // naturally, replace both with your real credentials or an application-specific password
    //},
    auth: {
      user: "signtalklearnisl@gmail.com",
      pass: "testing@SIGNTALK1", // naturally, replace both with your real credentials or an application-specific password
    },
  });

  let mailOptions = {
    from: "Verification<vindication@enron.com>",
    to: `${email}`,
    subject: "Your Email Verification Code for NovaSign",
    html: `Your code is ${otp}`,
  };

  mailOptions =
    otp == 0
      ? {
          from: "Verification<vindication@enron.com>",
          to: `${email}`,
          subject: "Reset your Password for NovaSign",
          html: `Please visit this link to reset your password : <br> <br> <a href = "https://signtalk.in/learnisl/resetpass/?token=${token}">Reset your Password</a>`,
        }
      : mailOptions;
  console.log(mailOptions);
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return { message: "message not sent" };
    } else {
      console.log("Email sent: " + info.response);
      return { message: "message  sent succesfuly" };
    }
  });
};

module.exports = { generateOtp, sendMail };
