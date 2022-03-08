const track_Model = require("../../models/Track/index");
const group_Model = require("../../models/group/index");
const userTrackInfo_Model = require("../../models/userTrack/index")

module.exports = {
  get: {
    fetchTrackByCreatorId: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await track_Model
          .find({ creatorUserId: userData._id })
          .populate("groupId");
        if (userTrackData === null) {
          return res.status(200).json({ status: "success", message: `no Data in db` });
        }
        return res.status(200).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(200).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchTrackByGroups: async (req, res) => {
      try {
        let userData = req.user;
        let groupId = req.body.groupId;
        let GroupTrackData = await track_Model.find({ groupId }).populate("groupId");
        if (GroupTrackData === null) {
          return res.status(200).json({ status: "success", message: `no Data in db` });
        }
        return res.status(200).json({ status: "success", message: GroupTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(200).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchTrackAssignedToLearner: async (req, res) => {
      try {
        let userData = req.user;
        // let trackData = await track_Model.find({}).populate("groupId").populate('creatorUserId');
        let groupData = await group_Model.find({employees:{$in:[userData._id]}},{_id:1}).lean()
        let userTrackData=[];
        for(let i=0;i<groupData.length;i++){
          let foo = await track_Model.findOne({groupId:groupData[i]._id}).populate('creatorUserId').lean()
          foo === null ? '' : userTrackData.push(foo)
        }
        for(let j=0;j<userTrackData.length;j++){
          let bar = await userTrackInfo_Model.findOne({creatorUserId:userData._id,trackId:userTrackData[j]._id}).lean();
          userTrackData[j].trackProgress = bar.trackProgress===undefined?'':bar.trackProgress
          userTrackData[j].trackState = bar.trackState===undefined?'':bar.trackState
          userTrackData[j].isArchived = bar.isArchived===undefined?'':bar.isArchived
        }
        console.log(userTrackData)
        
        

        // if (userTrackData === null) {
        //   return res.status(200).json({ status: "success", message: `no Data in db` });
        // }
        // return res.status(200).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(200).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  post: {
    createTrack: async (req, res) => {
      try {
        let userData = req.user;
        const getRandomInt = (max) => {
          return Math.floor(Math.random() * max);
        };
        let randomNumber = getRandomInt(3);
        let data = {
          creatorUserId: userData._id,
          trackName: req.body.trackName,
          groupId: req.body.groupId, // for now added if needed any change do let me know
          groupName: req.body.groupName,
          selectedTheme: req.body.selectedTheme,
          skillTag: req.body.skillTag,
          description: req.body.description,
          organization: req.user.organization,
        };
        let savedData = await track_Model.create(data);
        return res
          .status(201)
          .json({ status: "success", message: `successfully saved the data in db` });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(200).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  put: {},
  delete: {},
};
