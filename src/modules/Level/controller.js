const level_Model = require("../../models/Level/index");
module.exports = {
  get: {
    fetchUserLevel: async (req, res) => {
      try {
        let userData = req.user;
        let userTrackData = await level_Model.find({ userId: userData._id });
        if (userTrackData === null) {
          return res.status(201).json({ status: "success", message: `no Data in db` });
        }
        return res.status(201).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res
          .status(201)
          .json({
            status: "failed",
            message: `err.name : ${err.name}, err.message:${err.message}`,
          });
      }
    },
    fetchUserLevelByTrack: async (req, res) => {
      try {
        let userData = req.user;
        let trackId = req.body.trackId;
        let userTrackData = await level_Model.find({ trakId });
        if (userTrackData === null) {
          return res.status(201).json({ status: "success", message: `no Data in db` });
        }
        return res.status(201).json({ status: "success", message: userTrackData });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res
          .status(201)
          .json({
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
          userId: userData._id,
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
        };
        let savedData = await level_Model.create(data);
        return res
          .status(201)
          .json({ status: "success", message: `successfully saved the data in db` });
      } catch (err) {
        console.log(err.name);
        console.log(err.message);
        res
          .status(201)
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
