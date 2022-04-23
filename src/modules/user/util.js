const nodemailer = require("nodemailer");
const { generateError } = require("../../utils/error");

const sendMail = async (otp, email, token, domain) => {
  const transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "signtalklearnisl@gmail.com",
      pass: "testing@SIGNTALK1", // naturally, replace both with your real credentials or an application-specific password
    },
  });

  let mailOptions = {
    from: "Verification<vindication@enron.com>",
    to: `${email}`,
    subject: "OTP for SignUp verification with PaddleBoat",
    html: `Welcome!
    <br/>
    <br/>
    We're excited to get you started! First, let’s verify your account. Here is your OTP for verification: ${otp}
    <br/><br/>
    Reach out to the system admin in case you face any difficulties. 
    <br/>
    <br/>
    Thanks,<br/>
    Team PaddleBoat`,
  };

  mailOptions =
    otp == 0
      ? {
          from: "Verification<vindication@enron.com>",
          to: `${email}`,
          subject: "Reset Password for PaddleBoat",
          html: `Hi there!<br/><br/>

          We noticed you wanted to reset your password for PaddleBoat. 
          Head over to this link : https://www.${domain}.padboat.com/reset-password/?token=${token} to quickly set up a new one!
          <br/><br/>
          Thanks,<br/>
          Team PaddleBoat`,
        }
      : mailOptions;
  console.log({ mailOptions, otp, email, token });
  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      generateError("message not sent ", error);
    } else {
      console.log("Email sent: " + info.response);
      return { message: "message  sent succesfuly" };
    }
  });
};

module.exports = { sendMail };
