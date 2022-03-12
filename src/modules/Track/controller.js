const track_Model = require("../../models/Track/index");
const group_Model = require("../../models/group/index");
const userTrackInfo_Model = require("../../models/userTrack/index")
const level_Model = require("../../models/level/index")

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
        let groupId = req.params.groupId;
        let GroupTrackData = await track_Model.find({ groupId:{$in:[groupId]},creatorUserId:userData._id },{__v:0,createdAt:0,updatedAt:0}).populate("groupId","-__v -createdAt -updatedAt").lean();
        if (GroupTrackData === null) {
          return res.status(200).json({ status: "success", message: `no Data in db` });
        }
        for(let i=0;i<GroupTrackData.length;i++){
          let levelData159 = await level_Model.find({trackId:GroupTrackData[i]._id},{__v:0,createdAt:0,updatedAt:0}).lean();
          GroupTrackData[i].levelData = levelData159
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
    fetchTrackWithNoGroups: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await track_Model.find({ creatorUserId: userData._id },{__v:0,createdAt:0,updatedAt:0}).lean();
        if (userTrackData === null) {
          return res.status(200).json({ status: "success", message: `no Data in db` });
        }
        let tranformData = userTrackData.filter(element => element.groupId===undefined || element.groupId.length===0)
        for(let i=0;i<tranformData.length;i++){
          let levelData159 = await level_Model.find({trackId:tranformData[i]._id},{__v:0,createdAt:0,updatedAt:0}).lean();
          tranformData[i].levelData = levelData159
        }
        return res.status(200).json({ status: "success", message: tranformData });
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
        let groupData = await group_Model.find({employees:{$in:[userData._id]}},{_id:1}).lean()
        let userTrackData=[];
        for(let i=0;i<groupData.length;i++){
          let foo = await track_Model.findOne({groupId:groupData[i]._id},{__v:0,createdAt:0,updatedAt:0}).populate('creatorUserId','-__v -createdAt -updatedAt -lastSession').lean()
          foo === null ? '' : userTrackData.push(foo)
        }
        for(let j=0;j<userTrackData.length;j++){
          let bar = await userTrackInfo_Model.findOne({creatorUserId:userData._id,trackId:userTrackData[j]._id}).lean();
          let foobar = await level_Model.find({trackId:userTrackData[j]._id}).lean()
          userTrackData[j].trackProgress = bar.trackProgress===undefined?'':bar.trackProgress;
          userTrackData[j].trackState = bar.trackState===undefined?'unattemped':bar.trackState;
          userTrackData[j].isArchived = bar.isArchived===undefined?'':bar.isArchived;
          userTrackData[j].totalLevelCount = foobar.length;
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
          groupId: req.body.groupId, 
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
  put: {
    updateTrack: async (req, res) => {
      try {
        let userData = req.user;
        let trackId = req.params.trackId;
        let data = {
          trackName: req.body.trackName,
          groupId: req.body.groupId, 
          groupName: req.body.groupName,
          selectedTheme: req.body.selectedTheme,
          skillTag: req.body.skillTag,
          description: req.body.description,
          organization: req.user.organization,
        };
        let updatedData = await track_Model.findOne({creatorUserId:userData._id,_id:trackId}).update(data);
        if(updatedData.n===1 && updatedData.nModified===1 && updatedData.ok===1)
          return res.status(200).json({ status: "success", message: `successfully updated the data in db` });
        throw({name:'updation Error',message:'something went wrong while updating data please try again or contact admin'})
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
  delete: {
    deleteTrack: async (req, res) => {
      try {
        let userData = req.user;
        let trackId = req.params.trackId;
        let trackData = await track_Model.findOneAndDelete({ creatorUserId: userData._id,_id:trackId})
        return res.status(200).json({ status: "success", message: 'track deleted successfully' });
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
};
