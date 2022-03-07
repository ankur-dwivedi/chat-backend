const track_Model = require("../../models/Track/index");
const { trackColorFill, trackColorBorder,selectedTheme } = require("../../utils/constants");
module.exports = {
  get: {
    fetchUserTrack: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await track_Model.find({ creatorUserId: userData._id }).populate('groupId');
        if (userTrackData === null) {
          return res.status(200).json({ status: "success", message: `no Data in db` });
        }
        return res.status(200).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res
          .status(200)
          .json({
            status: "failed",
            message: `err.name : ${err.name}, err.message:${err.message}`,
          });
      }
    },
    fetchTrackByGroups: async (req, res) => {
      try {
        let userData = req.user;
        let groupId = req.body.groupId;
        let GroupTrackData = await track_Model.find({ groupId }).populate('groupId');;
        if (GroupTrackData === null) {
          return res.status(200).json({ status: "success", message: `no Data in db` });
        }
        return res.status(200).json({ status: "success", message: GroupTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res
          .status(200)
          .json({
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
          selectedTheme:selectedTheme[randomNumber],
          skillTag: req.body.skillTag,
          organization: req.user.organization,
        };
        let savedData = await track_Model.create(data);
        return res
          .status(201)
          .json({ status: "success", message: `successfully saved the data in db` });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res
          .status(200)
          .json({
            status: "failed",
            message: `err.name : ${err.name}, err.message:${err.message}`,
          });
      }
    },
  },
  put: {},
  delete: {},
};
