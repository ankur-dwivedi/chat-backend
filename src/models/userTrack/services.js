const level_model = require("../level/index");
const userTrackInfo_model = require("../userTrack/index");
const userLevelInfo_model = require("../userLevel/index");
const organization_model=require('../organization/index');
//imports for sending mail are as following
const group_model = require("../group/index");
const track_Model = require("../Track/index");
const nodemailer = require("nodemailer");
const CronJob = require('cron').CronJob;

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
      let completedScore =
        (completedLevels.length / fetchAllTrackLevels.length) * 100;
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

let transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

let verify = async () => {
  try {
    let status = await transport.verify();
    await console.log(status);
  } catch (err) {
    console.log(err);
  }
};
verify();

const nodeMailerSendMail = async (email, subject, html) => {
  let status = await transport.sendMail({
    from: "support@padboat.com",
    to: email,
    subject: subject,
    html: html,
  });
  try {
    return status;
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
      fetchGroupData === null
        ? ""
        : (groupData = [...groupData, ...fetchGroupData.employees]);
    }
    // console.log(groupData);
    //logic to access that perticular email and send email
    for (let j = 0; j < groupData.length; j++) {
      let fetchUserTrackInfo = await userTrackInfo_model
        .findOne({ creatorUserId: groupData[j]._id, trackId: trackData._id })
        .lean();
      let organizationData = await organization_model.findOne({_id:trackData.organization},{domain:1}).lean();
      console.log(organizationData.domain)
      if (fetchUserTrackInfo === null) {
        let learnerEmail = groupData[j].email;
        let learnerName = groupData[j].name;
        let learnerId = groupData[j].employeeId;
        let subject = `New Learning Track assigned`;
        let html = `<p><span>Hey there <b>${learnerName}!</b></span></p>
        <p><span>You&rsquo;ve just been assigned a new learning track - ${trackData.trackName} by ${trackData.creatorName}.</span></p>
        <p><span>It is always exciting to embark on a new journey! On this note, let&rsquo;s start with the newly added levels in the track.</span></p>
        <p><span>Head over to https://${organizationData.domain}.padboat.com/tracks/${trackData._id}/level-view to check out some new content!</span></p>
        <p><span>Reach out to the system admin in case you face any difficulties.&nbsp;</span></p>
        <p><span>Thanks,</span></p>
        <p><span>Team PaddleBoat</span></p>`;
        let status = await nodeMailerSendMail(learnerEmail, subject, html);
        // console.log(status);
        if (status.accepted.includes(learnerEmail)) {
          //this means mail was send successfully
          let userTrackData = {
            creatorUserId: groupData[j]._id,
            trackId: trackData._id,
            welcomeMailSend: true,
          };
          await userTrackInfo_model.create(userTrackData);
        }
      } else {
        if (fetchUserTrackInfo.welcomeMailSend !== true) {
          let learnerEmail = groupData[j].email;
          let learnerName = groupData[j].name;
          let learnerId = groupData[j].employeeId;
          let subject = `New Learning Track assigned`;
          let html = `<p><span>Hey there <b>${learnerName}!</b></span></p>
          <p><span>You&rsquo;ve just been assigned a new learning track - ${trackData.trackName} by ${trackData.creatorName}.</span></p>
          <p><span>It is always exciting to embark on a new journey! On this note, let&rsquo;s start with the newly added levels in the track.</span></p>
          <p><span>Head over to https://${organizationData.domain}.padboat.com/tracks/${trackData._id}/level-view to check out some new content!</span></p>
          <p><span>Reach out to the system admin in case you face any difficulties.&nbsp;</span></p>
          <p><span>Thanks,</span></p>
          <p><span>Team PaddleBoat</span></p>`;
          let status = await nodeMailerSendMail(learnerEmail, subject, html);
          // console.log(status);
          if (status.accepted.includes(learnerEmail)) {
            //this means mail was send successfully
            let userTrackData = {
              creatorUserId: groupData[j]._id,
              trackId: trackData._id,
              welcomeMailSend: true,
            };
            await userTrackInfo_model.create(userTrackData);
          }
        } else {
          console.log("mail already send before");
        }
      }
    }
  } catch (err) {
    console.log(err.name);
    console.log(err.message);
  }
};
//seven 
//three

const dueDateReminderSendMailToUsers = async () => {
  const {dueDateReminder} = process.env
  let fetchAllTrackData = await track_Model
    .find({})
    .populate({
      path: "groupId",
      select: "employees -_id",
      populate: {
        path: "employees",
        select: "name email _id",
        populate:{
          path:"organization",
          select:'domain -_id'
        }
      },
    }).lean();
 
  let filterAllTrackData = fetchAllTrackData.filter(
    (element) => element.groupId !== null && element.groupId.length !== 0
  ).map(element=>{
    return{
      _id:element._id,
      trackName:element.trackName,
      groupId:element.groupId.map(element=>element.employees)
    }
  });

  for (let i = 0; i < filterAllTrackData.length; i++) {
    let allLevelData = await level_model.find({ trackId: filterAllTrackData[i]._id }).lean();
    //this condition statisfy for track created without levels
    if(allLevelData.length!==0){
      let filterAllLevelData = allLevelData.filter((element) => element.dueDate !== undefined);
      for(let j=0;j<filterAllLevelData.length;j++){
        for(let k=0;k<filterAllTrackData[i].groupId[0].length;k++){
          let todaysDate = new Date()
          let levelDueDate = new Date(filterAllLevelData[j].dueDate)
          //1)First Comparing today's date with dueDate
          // logic to compare today's date with dueDate

          // console.log("today's Date",`${todaysDate.getDate()}/${todaysDate.getMonth()}/${todaysDate.getFullYear()}`)
          // console.log("due Date",`${levelDueDate.getDate()}/${levelDueDate.getMonth()}/${levelDueDate.getFullYear()}`)

          if(levelDueDate.getFullYear()===todaysDate.getFullYear() && levelDueDate.getMonth()===todaysDate.getMonth()){
            let difference = levelDueDate.getDate() - todaysDate.getDate()
            if(difference === parseInt(dueDateReminder)){
              let userLevelData = await userLevelInfo_model.findOne({learnerId:filterAllTrackData[i].groupId[0][k]._id,levelId:filterAllLevelData[j]._id}).lean()
              //2)Second Comparizon based on userLevelData 
              if(userLevelData===null){
                //if no userLevelData available
                //send mail
                const email = filterAllTrackData[i].groupId[0][k].email;
                const subject = "Deadline approaching soon";
                const html = `
                <p><span>Hey there <b>${filterAllTrackData[i].groupId[0][k].name}!</b></span></p>
                <p><span>We thought we&rsquo;d drop by here and remind you about completing ${filterAllLevelData[j].levelName} which is due soon/is due by <b>${levelDueDate.getDate()}/${levelDueDate.getMonth()+1}/${levelDueDate.getFullYear()}.</b></span></p>
                <p><span>Head over to https://${filterAllTrackData[i].groupId[0][k].organization.domain}.padboat.com/tracks/${filterAllTrackData[i]._id}/level-view to complete ${filterAllLevelData[j].levelName} and continue on your learning journey!</span></p>
                <p><span>Reach out to the system admin in case you face any difficulties.&nbsp;</span></p>
                <p><span>Thanks,</span></p>
                <p><span>Team PaddleBoat</span></p>
                `
                console.log('hence send mail to')
                nodeMailerSendMail(email,subject,html)
              }else if(userLevelData.levelStatus!=='pass'){
                //if user has not passed the level 
                //send mail
                const email = filterAllTrackData[i].groupId[0][k].email;
                const subject = "Deadline approaching soon";
                const html = `
                <p><span>Hey there <b>${filterAllTrackData[i].groupId[0][k].name}!</b></span></p>
                <p><span>We thought we&rsquo;d drop by here and remind you about completing ${filterAllLevelData[j].levelName} which is due soon/is due by <b>${levelDueDate.getDate()}/${levelDueDate.getMonth()+1}/${levelDueDate.getFullYear()}.</b></span></p>
                <p><span>Head over to https://${filterAllTrackData[i].groupId[0][k].organization.domain}.padboat.com/tracks/${filterAllTrackData[i]._id}/level-view to complete ${filterAllLevelData[j].levelName} and continue on your learning journey!</span></p>
                <p><span>Reach out to the system admin in case you face any difficulties.&nbsp;</span></p>
                <p><span>Thanks,</span></p>
                <p><span>Team PaddleBoat</span></p>
                `
                console.log('hence send mail to')
                nodeMailerSendMail(email,subject,html)
              }
            }
          }
          
        }
      }

    }
  }
};

const job = new CronJob('00 00 * * *', dueDateReminderSendMailToUsers, null, true, 'Asia/Kolkata');

job.start();


module.exports = {
  updateTrackStatus,
  sendMailToUsersAssignedToTracks,
  nodeMailerSendMail,
};
