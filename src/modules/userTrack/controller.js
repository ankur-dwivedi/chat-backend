const userTrack_Model = require('../../models/userTrack/index');
const track_Model = require('../../models/Track/index');

module.exports = {
  get: {
    fetchUserTrackInfo: async (req, res) => {
      try {
        let isArchivedFlag = req.query.isArchived === undefined ? 'null' : req.query.isArchived;
        let userData = req.user;
        let userTrackData = undefined;
        if (isArchivedFlag === 'null') {
          userTrackData = await userTrack_Model.find({ creatorUserId: userData._id }).lean();
        } else {
          userTrackData = await userTrack_Model
            .find({ creatorUserId: userData._id, isArchived: isArchivedFlag })
            .lean();
        }
        if (userTrackData === null) {
          return res.status(200).json({ status: 'success', message: `no Data in db` });
        }
        return res.status(200).json({ status: 'success', message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(200).json({
          status: 'failed',
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  post: {
    createUserTrackInfo: async (req, res) => {
      try {
        let userData = req.user;
        let body = req.body;
        //validation logic to check whether the track id provided is valid or not
        let validateTrackId = await track_Model
          .findOne({ _id: body.trackId })
          .populate('groupId')
          .lean();
        if (validateTrackId === null) {
          throw {
            name: 'validationError',
            message: 'please send a valid trackId',
          };
        }
        //validation logic to check whether the user is assigned to this track or not
        let temp = validateTrackId.groupId.map((element) => {
          return element.employees.filter((element1) => {
            return element1.toString() === userData._id.toString();
          });
        });
        if (temp.length === 0) {
          throw {
            name: 'authorizationError',
            message: 'you are not assigned to this track',
          };
        }
        //validation logic ends here
        body.creatorUserId = userData._id;
        let userTrackInfo = await userTrack_Model
          .findOne({ creatorUserId: userData._id, trackId: body.trackId })
          .lean();
        //logic to first check whether data is available or not if not then create or update
        if (userTrackInfo === null) {
          let savedData = await userTrack_Model.create(body);
          return res.status(201).json({
            status: 201,
            success: true,
            data: `successfully saved the data in db`,
          });
        } else {
          userTrackInfo.isArchived = body.isArchived;
          let updatedData = await userTrack_Model
            .findOne({ creatorUserId: userData._id, trackId: body.trackId })
            .update(userTrackInfo);
          if (updatedData.n === 1 && updatedData.nModified === 1 && updatedData.ok === 1) {
            return res.status(201).json({
              status: 201,
              success: true,
              data: `successfully updated the data in db`,
            });
          }
          throw {
            name: 'dbError',
            message: 'something went wrong while updating data please try again or contact admin',
          };
        }
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        return res.status(400).json({
          status: 400,
          success: false,
          data: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  put: {
    // updateUserTrackInfo: async (req, res) => {
    //   try {
    //     let userData = req.user;
    //     let userTrackId = req.params.userTrackId;
    //     let body = req.body;
    //     let userTrackInfo = await userTrack_Model
    //       .findOne({ creatorUserId: userData._id, trackId: userTrackId })
    //       .lean();
    //     if (userTrackInfo === null) {
    //       throw {
    //         name: "validationError",
    //         message: "please send a valid userTrackId",
    //       };
    //     }
    //     userTrackInfo.isArchived = body.isArchived; //updating oldUserTrack Info
    //     let updateData = await userTrack_Model
    //       .findOne({ creatorUserId: userData._id, trackId: userTrackId })
    //       .update(userTrackInfo);
    //     // console.log(updateData)
    //     if (
    //       updateData.n === 1 &&
    //       updateData.nModified === 1 &&
    //       updateData.ok === 1
    //     ) {
    //       return res
    //         .status(200)
    //         .json({ status: "success", message: "updated data successfully" });
    //     }
    //     throw {
    //       name: "dbError",
    //       message:
    //         "something went wrong while updating data please try again or contact admin",
    //     };
    //   } catch (err) {
    //     console.log(err.name);
    //     console.log(err.message);
    //     return res.status(400).json({
    //       status: "failed",
    //       message: `err.name : ${err.name}, err.message:${err.message}`,
    //     });
    //   }
    // },
  },
  delete: {},
};
