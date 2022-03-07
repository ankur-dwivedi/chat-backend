const { getUsersByTrackId } = require("../../models/Track/services");
const nodemailer = require("nodemailer");
const { generateError } = require("../../utils/error");
const { get } = require("../../models/user/services.js");
const { Types } = require("mongoose");
const sendMail = async (from, email, subject, body) => {
  return new Promise(async (resolve, reject) => {
    const transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "", // add credentials
        pass: "",
      },
    });

    let mailOptions = {
      from: `${from}`,
      to: `${email}`,
      subject: `${subject}`,
      text: `${body}`,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        resolve(false);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

module.exports = {
  sendLevelCreationMailsToUsers: async (trackId, levelName, creatorId) => {
    const data = await getUsersByTrackId({ id: trackId });
    const users = data.groupId.employees;
    const from = "Notification<himalig11@gmail.com>";
    let subject = `A New level ${levelName} has been added to track ${data.trackName}`;
    let usersEmailSent = [];
    let usersEmailFailed = [];
    for (const user of users) {
      let body = `Hey ${user.name},\n\n` + subject + ` assigned to you`;
      let emailSent = await sendMail(from, user.email, subject, body);
      console.log(emailSent);
      if (emailSent) {
        console.log(user.name);
        usersEmailSent.push(user.name);
        console.log(usersEmailSent);
      } else {
        console.log(user.name);
        usersEmailFailed.push(user.name);
      }
    }
    console.log(usersEmailSent);
    // get email id of the creatore and mail him this list, in case error occurs during that then log it.
    console.log(creatorId);
    const creatorData = await get({ id: creatorId });
    subject = `User Email Stats for level ${levelName} Creation`;
    let body = `Following users could not be notified : \n\n${usersEmailFailed}`;
    let creatorMailingStatus = await sendMail("cascade<>", creatorData.email, subject, body);
    if (creatorMailingStatus) {
      console.log("Creator Notified of user mails");
    } else {
      console.log(
        `creator could not be notified of user mails for level creation\n Following users could not be notified ${usersEmailFailed}`
      );
    }
    //return {"emailsSent":usersEmailSent, "emailsFailed":usersEmailFailed}
  },
};
