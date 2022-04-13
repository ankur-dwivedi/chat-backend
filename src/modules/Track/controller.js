const track_Model = require("../../models/Track/index");
const group_Model = require("../../models/group/index");
const userTrackInfo_Model = require("../../models/userTrack/index");
const level_Model = require("../../models/level/index");
const randomstring = require("randomstring");
const user_model = require("../../models/user/index");

module.exports = {
  get: {
    fetchTrackByCreatorId: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await track_Model
          .find({ creatorUserId: userData._id })
          .populate("groupId");
        if (userTrackData === null) {
          return res
            .status(200)
            .json({ status: "success", message: `no Data in db` });
        }
        return res
          .status(200)
          .json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchTrackByGroups: async (req, res) => {
      try {
        let userData = req.user;
        let groupId = req.params.groupId;
        let GroupTrackData = await track_Model
          .find(
            { groupId: { $in: [groupId] }, creatorUserId: userData._id },
            { __v: 0, createdAt: 0, updatedAt: 0 }
          )
          .populate("groupId", "-__v -createdAt -updatedAt")
          .lean();
        if (GroupTrackData === null) {
          return res
            .status(200)
            .json({ status: "success", message: `no Data in db` });
        }
        for (let i = 0; i < GroupTrackData.length; i++) {
          let levelData159 = await level_Model
            .find(
              { trackId: GroupTrackData[i]._id },
              { __v: 0, createdAt: 0, updatedAt: 0 }
            )
            .lean();
          GroupTrackData[i].levelData = levelData159;
        }
        return res
          .status(200)
          .json({ status: "success", message: GroupTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    getTracksWithoutUserCreatedGroup: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await track_Model
          .find(
            { creatorUserId: userData._id },
            { __v: 0, createdAt: 0, updatedAt: 0 }
          ).populate({
            path:'groupId',
            select:'employees -_id'
          })
          .lean();
        if (userTrackData === null) {
          return res
            .status(200)
            .json({ status: 200, success: false, data: `no Data in db` });
        }
        //filtering this data here so to give user list of track hich does not contains groupId
        let tranformData1 = userTrackData.filter(
          (element) =>
            element.groupId === null ||
            element.groupId === undefined ||
            element.groupId.length === 0
        );
        let tranformData2 = userTrackData.filter(
          (element) => element.botGeneratedGroup === true
        );
        let tranformData = [...tranformData1, ...tranformData2];
        for (let i = 0; i < tranformData.length; i++) {
          let levelData159 = await level_Model
            .find(
              { trackId: tranformData[i]._id },
              { __v: 0, createdAt: 0, updatedAt: 0 }
            )
            .lean();
          tranformData[i].levelData = levelData159;
        }
        return res
          .status(200)
          .json({ status: "success", message: tranformData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchTrackAssignedToLearner: async (req, res) => {
      try {
        let archived =
          req.query.archived === "true"
            ? true
            : req.query.archived === "false"
            ? false
            : "";
        let userData = req.user;
        let groupData = await group_Model
          .find({ employees: { $in: [userData._id] } }, { _id: 1 })
          .lean();
        // console.log(groupData)
        let userTrackData = [];
        for (let i = 0; i < groupData.length; i++) {
          let foo = await track_Model
            .find(
              { groupId: { $in: [groupData[i]._id] } },
              { __v: 0, createdAt: 0, updatedAt: 0 }
            )
            .populate({ path: "creatorUserId", select: "name employeeId" })
            .lean();
          // console.log(foo)
          userTrackData =
            foo === null
              ? [...userTrackData, ...foo]
              : [...userTrackData, ...foo];
        }
        for (let j = 0; j < userTrackData.length; j++) {
          let bar = await userTrackInfo_Model
            .findOne({
              creatorUserId: userData._id,
              trackId: userTrackData[j]._id,
            })
            .lean();
          let foobar = await level_Model
            .find({ trackId: userTrackData[j]._id })
            .lean();
          bar === null
            ? (userTrackData[j].trackProgress = "")
            : (userTrackData[j].trackProgress =
                bar.trackProgress === undefined ? "" : bar.trackProgress);
          bar === null
            ? (userTrackData[j].trackState = "unattemped")
            : (userTrackData[j].trackState =
                bar.trackState === undefined ? "unattemped" : bar.trackState);
          bar === null
            ? (userTrackData[j].isArchived = false)
            : (userTrackData[j].isArchived =
                bar.isArchived === undefined ? false : bar.isArchived);
          foobar.length === 0
            ? userTrackData.splice(j, 1)
            : (userTrackData[j].totalLevelCount = foobar.length);
        }
        console.log(userTrackData);
        if (archived === "") {
          return res
            .status(200)
            .json({ status: 200, success: true, data: userTrackData });
        } else {
          convertedUserTrack = userTrackData.filter(
            (element) => element.isArchived === archived
          );
          return res
            .status(200)
            .json({ status: 200, success: true, data: convertedUserTrack });
        }
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchTrackInfoForTransferTab: async (req, res) => {
      try {
        let userData = req.user;
        let organization = userData.organization;
        let organizationData = await user_model.find({organization,role:'creator'},{_id:1,name:1}).lean();
        let trackData = await track_Model
          .find(
            { creatorUserId: userData._id },
            { trackName: 1, _id: 1, description: 1, groupId: 1 }
          )
          .populate({
            path: "groupId",
            select: "name botGeneratedGroup description -_id",
          })
          .lean();

        return res.status(200).json({
          status: 200,
          success: true,
          data: {trackData,creatorData:organizationData},
        });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  post: {
    createTrack: async (req, res) => {
      try {
        let userData = req.user;
        let data = {
          creatorUserId: userData._id,
          trackName: req.body.trackName,
          groupId: req.body.groupId,
          groupName: req.body.groupName,
          selectedTheme: req.body.selectedTheme,
          skillTag: req.body.skillTag,
          description: req.body.description,
          organization: req.user.organization,
          botGeneratedGroup: req.body.groupId === undefined ? undefined : false,
        };
        let savedData = await track_Model.create(data);
        return res.status(201).json({
          status: "success",
          message: `successfully saved the data in db`,
        });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    createTrackUsingLearnerId: async (req, res) => {
      try {
        let userData = req.user;
        let { learnerIds } = req.body; //taking arrays of user ids from user
        let groupData = {
          name: randomstring.generate({ length: 16, charset: "alphabetic" }),
          employees: learnerIds,
          organization: userData.organization,
          description: "this is generated by code",
          createdBy: userData._id,
          botGeneratedGroup: true,
        };
        let savedGroupData = await group_Model.create(groupData);
        let data = {
          creatorUserId: userData._id,
          trackName: req.body.trackName,
          groupId: savedGroupData._id,
          selectedTheme: req.body.selectedTheme,
          skillTag: req.body.skillTag,
          description: req.body.description,
          organization: req.user.organization,
          botGeneratedGroup: true,
        };
        let savedData = await track_Model.create(data);
        return res.status(201).json({
          status: 201,
          success: true,
          data: `successfully saved the data in db`,
        });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    transferTrackOwner: async (req, res) => {
      try {
        let currentUserId = req.user._id;
        let newUserId = req.body.newUserId;
        let trackId = req.body.trackId;
        let count = 0;
        for (let i = 0; i < trackId.length; i++) {
          let trackData = await track_Model
            .findOne({ creatorUserId: currentUserId, _id: trackId[i] })
            .lean();
          if (trackData === null) {
            continue;
          } else {
            trackData.creatorUserId = newUserId;
            let updatedData = await track_Model
              .findOne({ creatorUserId: currentUserId, _id: trackId[i] })
              .updateOne(trackData);
            if (
              updatedData.n === 1 &&
              updatedData.nModified === 1 &&
              updatedData.ok === 1
            ) {
              count = count + 1;
            }
          }
        }
        if (count.length === trackId.length) {
          return res.status(200).json({
            status: 200,
            success: true,
            data: "OwnerShip of Track Changed Successfully",
          });
        } else {
          throw {
            name: "updation Error",
            message:
              "something went wrong while updating data please try again or contact admin",
          };
        }
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
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
          botGeneratedGroup: req.body.groupId === undefined ? undefined : false,
        };
        let updatedData = await track_Model
          .findOne({ creatorUserId: userData._id, _id: trackId })
          .update(data);
        if (
          updatedData.n === 1 &&
          updatedData.nModified === 1 &&
          updatedData.ok === 1
        )
          return res.status(200).json({
            status: "success",
            message: `successfully updated the data in db`,
          });
        throw {
          name: "updationError",
          message:
            "something went wrong while updating data please try again or contact admin",
        };
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    updateTrackUsingLearnerId: async (req, res) => {
      try {
        let userData = req.user;
        let {trackId} = req.params;
        let { learnerIds, deleteGroupId } = req.body; //taking arrays of user ids from user
        //fetching track data using trackid
        let oldTrackData = await track_Model.findOne({_id:trackId}).lean();
        if(oldTrackData===null){
          throw{
            name: "validationError",
            message: "please send valid trackId",
          }
        }
        //deleteing group Ids if required
        if(deleteGroupId!==undefined){
          for(let i=0;i<deleteGroupId.length;i++){
            await group_Model.findOneAndDelete({_id:deleteGroupId[i]})
          }
        }
        //creating a new group to add it in the track data
        let groupData = {
          name: randomstring.generate({ length: 16, charset: "alphabetic" }),
          employees: learnerIds,
          organization: userData.organization,
          description: "this is generated by code",
          createdBy: userData._id,
          botGeneratedGroup: true,
        };
        //storing in db
        let savedGroupData = await group_Model.create(groupData);
        //assigning objectid to trackid
        oldTrackData.groupId.push(savedGroupData._id);
        //assigning newData to oldData if any
        oldTrackData.trackName = req.body.trackName===undefined?oldTrackData.trackName:req.body.trackName;
        oldTrackData.selectedTheme = req.body.selectedTheme===undefined?oldTrackData.selectedTheme:req.body.selectedTheme;
        oldTrackData.skillTag = req.body.skillTag===undefined?oldTrackData.skillTag:req.body.skillTag;
        oldTrackData.description = req.body.description===undefined?oldTrackData.description:req.body.description;
        oldTrackData.organization = req.body.organization===undefined?oldTrackData.organization:req.body.organization;
        //updating old data
        let updatedData = await track_Model
          .findOne({ creatorUserId: userData._id, _id: trackId })
          .update(oldTrackData);
        if (updatedData.n === 1 && updatedData.nModified === 1 && updatedData.ok === 1)
          return res.status(200).json({
            status:200,
            success: true,
            data: `successfully updated the data in db`,
          });
        throw {
          name: "updationError",
          message: "something went wrong while updating data please try again or contact admin",
        };
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  delete: {
    deleteTrack: async (req, res) => {
      try {
        let userData = req.user;
        let trackId = req.params.trackId;
        let trackData = await track_Model.findOneAndDelete({
          creatorUserId: userData._id,
          _id: trackId,
        });
        return res
          .status(200)
          .json({ status: "success", message: "track deleted successfully" });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
};
