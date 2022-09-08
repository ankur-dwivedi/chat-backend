const track_Model = require('../../models/Track/index');
const group_Model = require('../../models/group/index');
const userTrackInfo_Model = require('../../models/userTrack/index');
const level_Model = require('../../models/level/index');
const randomstring = require('randomstring');
const user_model = require('../../models/user/index');
const { addGroupId } = require('../../models/user/services');
const {
  sendMailToUsersAssignedToTracks,
  sendMailToUsersAssignedToTracks2,
} = require('../../models/userTrack/services');

module.exports = {
  get: {
    fetchTrackByCreatorId: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await track_Model
          .find({ creatorUserId: userData._id })
          .populate('groupId');
        if (userTrackData === null) {
          return res.status(200).json({ status: 'success', message: `no Data in db` });
        }
        return res.status(200).json({ status: 'success', message: userTrackData });
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
          .populate('groupId', '-__v -createdAt -updatedAt')
          .lean();
        if (GroupTrackData === null) {
          return res.status(200).json({ status: 'success', message: `no Data in db` });
        }
        for (let i = 0; i < GroupTrackData.length; i++) {
          let levelData159 = await level_Model
            .find({ trackId: GroupTrackData[i]._id }, { __v: 0, createdAt: 0, updatedAt: 0 })
            .lean();
          GroupTrackData[i].levelData = levelData159;
        }
        return res.status(200).json({ status: 'success', message: GroupTrackData });
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
          .find({ creatorUserId: userData._id }, { __v: 0, createdAt: 0, updatedAt: 0 })
          .populate({
            path: 'groupId',
            select: 'employees _id',
            populate: {
              path: 'employees',
              select: '_id name employeeId',
            },
          })
          .lean();
        if (userTrackData === null) {
          return res.status(200).json({ status: 200, success: false, data: `no Data in db` });
        }
        //filtering this data here so to give user list of track hich does not contains groupId
        let tranformData1 = userTrackData.filter(
          (element) =>
            element.groupId === null ||
            element.groupId === undefined ||
            element.groupId.length === 0
        );
        let tranformData2 = userTrackData.filter((element) => element.botGeneratedGroup === true);
        let tranformData = [...tranformData1, ...tranformData2];
        for (let i = 0; i < tranformData.length; i++) {
          let levelData159 = await level_Model
            .find({ trackId: tranformData[i]._id }, { __v: 0, createdAt: 0, updatedAt: 0 })
            .lean();
          tranformData[i].levelData = levelData159;
        }
        return res.status(200).json({ status: 'success', message: tranformData });
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
          req.query.archived === 'true' ? true : req.query.archived === 'false' ? false : '';
        let userData = req.user;
        let groupData = await group_Model
          .find({ employees: { $in: [userData._id] } }, { _id: 1 })
          .lean();
        // console.log(groupData)
        let userTrackData = [];
        for (let i = 0; i < groupData.length; i++) {
          let foo = await track_Model
            .find({ groupId: { $in: [groupData[i]._id] } }, { __v: 0, createdAt: 0, updatedAt: 0 })
            .populate({ path: 'creatorUserId', select: 'name employeeId' })
            .lean();
          userTrackData = [...userTrackData, ...foo];
        }

        //code to remove dublicate surveyId from surveyResponse
        let removeDuplicate = userTrackData.filter(
          (value, index, self) =>
            index === self.findIndex((t) => t._id.toString() === value._id.toString())
        );
        userTrackData = [...removeDuplicate];
        console.log(userTrackData.length);
        for (let j = 0; j < userTrackData.length; j++) {
          let userTrackInfo = await userTrackInfo_Model
            .findOne({
              creatorUserId: userData._id,
              trackId: userTrackData[j]._id,
            })
            .lean();
          console.log(userTrackInfo);
          let userTrackLevelInfo = await level_Model
            .find({ trackId: userTrackData[j]._id, levelState: 'launch' })
            .lean();
          userTrackData[j].trackProgress =
            userTrackInfo === null || userTrackInfo.trackProgess === undefined
              ? ''
              : userTrackInfo.trackProgress;
          userTrackData[j].trackState =
            userTrackInfo === null || userTrackInfo.trackState === undefined
              ? 'unattempted'
              : userTrackInfo.trackState;
          userTrackData[j].isArchived =
            userTrackInfo === null || userTrackInfo.isArchived === undefined
              ? false
              : userTrackInfo.isArchived;
          userTrackLevelInfo.length === 0
            ? (userTrackData[j].totalLevelCount = 0)
            : (userTrackData[j].totalLevelCount = userTrackLevelInfo.length);
        }

        let filterUserTrackData = undefined;

        if (archived === '') {
          filterUserTrackData = userTrackData.filter((element) => element.totalLevelCount !== 0);
        } else {
          filterUserTrackData = userTrackData.filter(
            (element) => element.totalLevelCount !== 0 && element.isArchived === archived
          );
        }

        return res.status(200).json({ status: 200, success: true, data: filterUserTrackData });
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
        let organizationData = await user_model
          .find({ organization, role: { $in: ['creator', 'admin'] } }, { _id: 1, name: 1 })
          .lean();
        let trackData = await track_Model
          .find(
            { creatorUserId: userData._id },
            { trackName: 1, _id: 1, description: 1, groupId: 1 }
          )
          .populate({
            path: 'groupId',
            select: 'name botGeneratedGroup description -_id',
          })
          .lean();

        return res.status(200).json({
          status: 200,
          success: true,
          data: { trackData, creatorData: organizationData },
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
          selectedTheme: req.body.selectedTheme,
          skillTag: req.body.skillTag,
          description: req.body.description,
          organization: req.user.organization,
          botGeneratedGroup: req.body.groupId === undefined ? undefined : false,
        };
        let savedData = await track_Model.create(data);
        savedData.creatorName = userData.name;
        savedData.organization = userData.organization;
        //code to send mail to the learners
        if (savedData.groupId !== undefined || savedData.groupId.length !== 0) {
          sendMailToUsersAssignedToTracks(savedData);
        }
        return res.status(201).json({
          status: 201,
          success: true,
          message: `successfully saved the data in db`,
          data: { id: savedData._id },
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
        let trackData = undefined;
        if (learnerIds === undefined || learnerIds.length === 0) {
          trackData = {
            creatorUserId: userData._id,
            trackName: req.body.trackName,
            selectedTheme: req.body.selectedTheme,
            skillTag: req.body.skillTag,
            description: req.body.description,
            organization: req.user.organization,
            botGeneratedGroup: false,
          };
        } else {
          let groupData = {
            name: randomstring.generate({ length: 16, charset: 'alphabetic' }),
            employees: learnerIds,
            organization: userData.organization,
            description: 'this is generated by code',
            createdBy: userData._id,
            botGeneratedGroup: true,
          };
          let savedGroupData = await group_Model.create(groupData);
          trackData = {
            creatorUserId: userData._id,
            trackName: req.body.trackName,
            groupId: savedGroupData._id,
            selectedTheme: req.body.selectedTheme,
            skillTag: req.body.skillTag,
            description: req.body.description,
            organization: req.user.organization,
            botGeneratedGroup: true,
          };
          //code to sync up groupId with users
          const temp = learnerIds.map((data) => {
            return { _id: data };
          });
          await addGroupId({ $or: temp }, savedGroupData._id);
          // end of code to sync up groupId with users
        }
        let savedData = await track_Model.create(trackData);
        savedData.creatorName = userData.name;
        savedData.organization = userData.organization;
        //code to send mail to learners
        if (savedData.groupId !== undefined || savedData.groupId.length !== 0) {
          sendMailToUsersAssignedToTracks(savedData);
        }
        return res.status(201).json({
          status: 201,
          success: true,
          message: `successfully saved the data in db`,
          data: { id: savedData._id },
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
        let nullCount = 0;
        for (let i = 0; i < trackId.length; i++) {
          let trackData = await track_Model
            .findOne({ creatorUserId: currentUserId, _id: trackId[i] })
            .lean();
          if (trackData === null) {
            nullCount = nullCount + 1;
            continue;
          } else {
            trackData.creatorUserId = newUserId;
            let updatedData = await track_Model
              .findOne({ creatorUserId: currentUserId, _id: trackId[i] })
              .updateOne(trackData);
            if (updatedData.n === 1 && updatedData.nModified === 1 && updatedData.ok === 1) {
              count = count + 1;
            }
          }
        }

        if (parseInt(nullCount) + parseInt(count) === trackId.length) {
          return res.status(200).json({
            status: 200,
            success: true,
            data: 'OwnerShip of Track Changed Successfully',
          });
        } else {
          throw {
            name: 'updation Error',
            message: 'something went wrong while updating data please try again or contact admin',
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
        let { groupId } = req.body;
        let oldTrackData = await track_Model.findOne({ _id: trackId }).lean();
        if (oldTrackData === null) {
          throw {
            name: 'validationError',
            message: 'please send a valid Id',
          };
        }
        let data = {
          trackName: req.body.trackName,
          groupId: req.body.groupId ? req.body.groupId : [],
          selectedTheme: req.body.selectedTheme,
          skillTag: req.body.skillTag,
          description: req.body.description,
          organization: req.user.organization,
          botGeneratedGroup: req.body.groupId === undefined ? undefined : false,
        };
        let updatedData = await track_Model
          .findOne({ creatorUserId: userData._id, _id: trackId })
          .updateOne(data);

        //code to validate and send mail to new learners
        if (groupId !== undefined) {
          if (groupId.length !== 0) {
            if (oldTrackData.groupId !== null && oldTrackData.groupId.length !== 0) {
              for (let i = 0; i < oldTrackData.groupId.length; i++) {
                for (let j = 0; j < groupId.length; j++) {
                  //enable this if you get single groupId
                  if (oldTrackData.groupId[i].toString() !== groupId[j].toString()) {
                    sendMailToUsersAssignedToTracks({
                      _id: trackId,
                      groupId: [groupId[j]],
                      trackName: data.trackName,
                      creatorName: userData.name,
                      organization: oldTrackData.organization,
                      // organization:userData.organization
                    });
                  }
                }
              }
            } else {
              sendMailToUsersAssignedToTracks({
                _id: trackId,
                groupId: [groupId[j]],
                trackName: data.trackName,
                creatorName: userData.name,
                organization: oldTrackData.organization,
                // organization:userData.organization
              });
            }
          }
        }
        if (updatedData.n === 1 && updatedData.nModified === 1 && updatedData.ok === 1)
          return res.status(200).json({
            status: 200,
            success: true,
            data: `successfully updated the data in db`,
          });
        throw {
          name: 'updationError',
          message: 'something went wrong while updating data please try again or contact admin',
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
        let { trackId } = req.params;
        let { singleGroupId } = req.body;
        let { learnerIds } = req.body; //taking arrays of user ids from user
        //fetching track data using trackId
        let oldTrackData = await track_Model
          .findOne({ creatorUserId: userData._id, _id: trackId })
          .lean();
        if (oldTrackData === null) {
          throw {
            name: 'validationError',
            message: 'please send valid trackId',
          };
        }
        if (singleGroupId !== undefined) {
          //fetching group data using singleGroupId
          const oldGroupData = await group_Model.findOne({ _id: singleGroupId }).lean();
          if (oldGroupData === null) {
            throw {
              name: 'validationError',
              message: 'please send valid groupId',
            };
          }
          //adding new learnerIds to oldGroupData
          oldGroupData.employees = [...oldGroupData.employees, ...learnerIds];
          //once added updating groupId
          const updateGroupData = await group_Model
            .findOne({ _id: singleGroupId })
            .updateOne(oldGroupData);
          if (
            updateGroupData.n === 1 &&
            updateGroupData.nModified === 1 &&
            updateGroupData.ok === 1
          ) {
            //updating oldTrackData with new data if avaialable
            oldTrackData.trackName =
              req.body.trackName === undefined ? oldTrackData.trackName : req.body.trackName;
            oldTrackData.selectedTheme =
              req.body.selectedTheme === undefined
                ? oldTrackData.selectedTheme
                : req.body.selectedTheme;
            oldTrackData.skillTag =
              req.body.skillTag === undefined ? oldTrackData.skillTag : req.body.skillTag;
            oldTrackData.description =
              req.body.description === undefined ? oldTrackData.description : req.body.description;
            oldTrackData.organization =
              req.body.organization === undefined
                ? oldTrackData.organization
                : req.body.organization;
            oldTrackData.botGeneratedGroup =
              req.body.botGeneratedGroup === undefined
                ? oldTrackData.botGeneratedGroup === undefined
                  ? true
                  : oldTrackData.botGeneratedGroup
                : req.body.botGeneratedGroup;
            //updating trackData
            const updateTrackData = await track_Model
              .findOne({ creatorUserId: userData._id, _id: trackId })
              .updateOne(oldTrackData);
            if (
              updateTrackData.n === 1 &&
              updateTrackData.nModified === 1 &&
              updateTrackData.ok === 1
            ) {
              //this should send the onBoarding email to new user
              sendMailToUsersAssignedToTracks2({
                _id: trackId,
                learnerIds,
                trackName: oldTrackData.trackName,
                creatorName: userData.name,
                organization: oldTrackData.organization,
              });
              return res.status(200).json({
                status: 200,
                success: true,
                data: `successfully updated the data in db`,
              });
            }
            throw {
              name: 'updationError',
              message: 'something went wrong while updating data please try again or contact admin',
            };
          } else {
            throw {
              name: 'updationError',
              message: 'something went wrong while updating data please try again or contact admin',
            };
          }
        } else {
          let groupData = {
            name: randomstring.generate({ length: 16, charset: 'alphabetic' }),
            employees: learnerIds,
            organization: userData.organization,
            description: 'this is generated by code',
            createdBy: userData._id,
            botGeneratedGroup: true,
          };
          let savedGroupData = await group_Model.create(groupData);
          // add group id to user collection by ankur
          const temp = learnerIds.map((data) => {
            return { _id: data };
          });
          await addGroupId({ $or: temp }, savedGroupData._id);
          // add group id to user collection by ankur
          //updating oldTrackData with new data if avaialable
          // console.log(oldTrackData);
          // console.log(oldTrackData.groupId);
          oldTrackData.groupId.push(savedGroupData._id);
          oldTrackData.trackName =
            req.body.trackName === undefined ? oldTrackData.trackName : req.body.trackName;
          oldTrackData.selectedTheme =
            req.body.selectedTheme === undefined
              ? oldTrackData.selectedTheme
              : req.body.selectedTheme;
          oldTrackData.skillTag =
            req.body.skillTag === undefined || req.body.skillTag.length === 0
              ? oldTrackData.skillTag
              : req.body.skillTag;
          oldTrackData.description =
            req.body.description === undefined ? oldTrackData.description : req.body.description;
          oldTrackData.organization =
            req.body.organization === undefined ? oldTrackData.organization : req.body.organization;
          oldTrackData.botGeneratedGroup = true;
          //updating trackData
          const updateTrackData = await track_Model
            .findOne({ creatorUserId: userData._id, _id: trackId })
            .updateOne(oldTrackData);
          if (
            updateTrackData.n === 1 &&
            updateTrackData.nModified === 1 &&
            updateTrackData.ok === 1
          ) {
            //this should send the onBoarding email to new user
            sendMailToUsersAssignedToTracks({
              _id: trackId,
              groupId: [savedGroupData._id],
              trackName: oldTrackData.trackName,
              creatorName: userData.name,
              organization: oldTrackData.organization,
              // organization:userData.organization
            });
            return res.status(200).json({
              status: 200,
              success: true,
              data: `successfully updated the data in db`,
            });
          }
          throw {
            name: 'updationError',
            message: 'something went wrong while updating data please try again or contact admin',
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
  delete: {
    deleteTrack: async (req, res) => {
      try {
        let userData = req.user;
        let trackId = req.params.trackId;
        let trackData = await track_Model.findOneAndDelete({
          creatorUserId: userData._id,
          _id: trackId,
        });
        return res.status(200).json({ status: 'success', message: 'track deleted successfully' });
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
