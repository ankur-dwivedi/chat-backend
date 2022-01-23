const nodemailer = require("nodemailer");
const { generateError } = require("../../utils/error");

const sendMail = async (otp, email, token) => {
  const transporter =await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "signtalklearnisl@gmail.com",
      pass: "testing@SIGNTALK1", // naturally, replace both with your real credentials or an application-specific password
    },
  });

  let mailOptions = {
    from: "Verification<vindication@enron.com>",
    to: `${email}`,
    subject: "Your Email Verification Code for Cascade",
    html: `Your code is ${otp}`,
  };

  mailOptions =
    otp == 0
      ? {
          from: "Verification<vindication@enron.com>",
          to: `${email}`,
          subject: "Reset your Password for Cascade",
          html: `Please visit this link to reset your password : <br> <br> <a href = "https://work.justcascade.com/resetpass/?token=${token}">Reset your Password</a>`,
        }
      : mailOptions;
  console.log({mailOptions,otp,email,token});
  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      generateError("message not sent ",error );
    } else {
      console.log("Email sent: " + info.response);
      return { message: "message  sent succesfuly" };
    }
  });
};

module.exports = { sendMail };
