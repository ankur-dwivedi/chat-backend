const level_model = require("../level/index");
const userTrackInfo_model = require("../userTrack/index");
const userLevelInfo_model = require("../userLevel/index");
//imports for sending mail are as following
const group_model = require("../group/index");
const nodemailer = require("nodemailer");

const updateTrackStatus = async (learnerId, trackId) => {
  try {
    let fetchAllTrackLevels = await level_model.find({ trackId }).lean();
    let learnerLevelStatus = [];
    let completedLevels = [];
    let activeLevels = [];
    let status = undefined;
    let score = undefined;
    //logic to find each level status
    for (let i = 0; i < fetchAllTrackLevels.length; i++) {
      let levelStatus = await userLevelInfo_model
        .findOne({ learnerId, levelId: fetchAllTrackLevels[i]._id })
        .lean();
      levelStatus === null ? "" : learnerLevelStatus.push(levelStatus);
      levelStatus === null
        ? ""
        : levelStatus.attemptStatus === "completed"
        ? completedLevels.push(levelStatus)
        : "";
      levelStatus === null
        ? ""
        : levelStatus.attemptStatus === "active"
        ? activeLevels.push(levelStatus)
        : "";
    }
    //logic to assign track status and score
    if (completedLevels.length === 0) {
      score = activeLevels.length;
      status = "inProgress";
    } else {
      let completedScore = (completedLevels.length / fetchAllTrackLevels.length) * 100;
      let activeScore = activeLevels.length;
      score = completedScore + activeScore;
      status = score === 100 ? "completed" : "inProgress";
    }
    // logic to first check whether the user track data already is present if not then create one
    let learnerTrackStatus = await userTrackInfo_model
      .findOne({ creatorUserId: learnerId, trackId })
      .lean();
    if (learnerTrackStatus === null) {
      let userTrackInfo = {
        creatorUserId: learnerId,
        trackId: trackId,
        trackProgress: score,
        trackState: status,
      };
      let createUserTrackData = await userTrackInfo_model.create(userTrackInfo);
    } else {
      learnerTrackStatus.trackProgress = score;
      learnerTrackStatus.trackState = status;
      let updateUserTrackData = await userTrackInfo_model
        .findOne({ creatorUserId: learnerId, trackId })
        .update(learnerTrackStatus);
    }
  } catch (err) {
    console.log(err.name);
    console.log(err.message);
  }
};

// let transport = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "signtalklearnisl@gmail.com",
//     pass: "testing@SIGNTALK1",
//   },
// });

// let verify = async () => {
//   try {
//     let status = await transport.verify();
//     await console.log(status);
//   } catch (err) {
//     console.log(err);
//   }
// };
// verify();

const nodeMailerSendMail = async (email, subject, html) => {
  let status = await transport.sendMail({
    from: `padboat.com`,
    to: email,
    subject: subject,
    html: html,
  });
  try {
    //  console.log(status)
  } catch (err) {
    console.log(err);
  }
};

const sendMailToUsersAssignedToTracks = async (trackData) => {
  try {
    let groupData = [];
    //logic to fetch all the user emails
    for (let i = 0; i < trackData.groupId.length; i++) {
      let fetchGroupData = await group_model
        .findOne({ _id: trackData.groupId[i] }, { employees: 1 })
        .populate({
          path: "employees",
          select: "name email employeeId",
        })
        .lean();
      fetchGroupData === null ? "" : (groupData = [...groupData, ...fetchGroupData.employees]);
    }
    console.log(groupData);
    //logic to access that perticular email and send email
    for (let j = 0; j < groupData.length; j++) {
      let learnerEmail = groupData[j].email;
      let learnerName = groupData[j].name;
      let learnerId = groupData[j].employeeId;
      let subject = `Update from Padboat`;
      let html = `
            <h3>Hello, ${learnerName}(${learnerId}) a new Track has been assigned to you</h3>
            <b>Greetings from Padboat!</b>`;
      nodeMailerSendMail(learnerEmail, subject, html);
    }
  } catch (err) {
    console.log(err.name);
    console.log(err.message);
  }
};

// sendMailToUsersAssignedToTracks({_id:'6230fd35c8a4072b850ea278',groupId:['6230f66fc8a4072b850ea225'],trackName:'gomu gomu no mi'})

module.exports = {
  updateTrackStatus,
  sendMailToUsersAssignedToTracks,
  nodeMailerSendMail,
};
