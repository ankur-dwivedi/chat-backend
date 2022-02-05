const level_Model = require("../../models/Level/index");
const { sendLevelCreationMailsToUsers } = require("./util");
module.exports = {
  get: {
    fetchUserLevel: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await level_Model.find({ creatorUserId: userData._id });
        if (userTrackData === null) {
          return res.status(201).json({ status: "success", message: `no Data in db` });
        }
        return res.status(201).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
    fetchUserLevelByTrack: async (req, res) => {
      try {
        let trackId = req.body.trackId;
        let userTrackData = await level_Model.find({ trackId });
        if (userTrackData === null) {
          return res.status(201).json({ status: "success", message: `no Data in db` });
        }
        return res.status(201).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res.status(201).json({
          status: "failed",
          message: `err.name : ${err.name}, err.message:${err.message}`,
        });
      }
    },
  },
  post: {
    createLevel: async (req, res) => {
      try {
        let userData = req.user;
        let data = {
          creatorUserId: userData._id,
          templatesId:req.body.templates,
          trackId: req.body.trackId,
          levelName: req.body.levelName,
          levelDescription: req.body.levelDescription,
          employeeRetryInDays: req.body.employeeRetryInDays,
          dueDate: req.body.dueDate,
          setTotalTimeForLevel: req.body.setTotalTimeForLevel,
          totalMinutes: req.body.totalMinutes,
          levelState: req.body.levelState,
          templates: req.body.templates,
          passingScore: req.body.passingScore,
          levelType: req.body.levelType,
          organization: req.user.organization,
        };
        let savedData = await level_Model.create(data);
        sendLevelCreationMailsToUsers(req.body.trackId, req.body.levelName, userData._id);
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
