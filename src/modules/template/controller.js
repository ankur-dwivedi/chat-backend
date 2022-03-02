const { get, create, deleteTemplate } = require("../../models/template/services");
const UserLevel = require("../../models/userLevel/services");
const { generateError } = require("../../utils/error");
const { uploadFiles } = require(".././../libs/aws/upload");
const User = require("../../models/user/services");
const { Types } = require("mongoose");
const { LEVEL_TYPE } = require("../../models/level/constants");
const Level = require("../../models/level/services");

const updateUserState = async ({ id, template, completed }) => {
  return await User.update(
    { _id: Types.ObjectId(id) },
    {
      currentState: {
        level: template.levelId,
        track: template.trackId,
        template: template._id,
        completed: completed ? completed : false,
      },
    }
  );
};
const getTemplates = async (req, res) => {
  try {
    if (req.query && req.query.levelId) {
      if (
        req.user.currentState &&
        req.user.currentState.level == req.query.levelId &&
        req.user.currentState.completed === false
      ) {
        const prevTemplate = await get({ id: req.user.currentState.template });
        if (prevTemplate && prevTemplate.templateOrder) {
          const templateOrder = prevTemplate.templateOrder + 1;
          const template = await get({ templateOrder, levelId: req.user.currentState.level });
          if (template)
            return res.send({
              status: 200,
              success: true,
              data: template,
            });
          else {
            //update current state  completed property of user
            const updatedUserState = await updateUserState({
              id: req.user._id,
              template: prevTemplate,
              completed: true,
            });
            req.user.currentState = updatedUserState.currentState;
            const levelCompleteData = await levelComplete({ levelId: req.query.levelId });
            return res.send({
              status: 200,
              success: true,
              message: "level completed",
              data: { ...levelCompleteData },
            });
          }
        } else {
          const template = await get({ templateOrder: 1, levelId: req.query.levelId });
          if (template)
            return res.send({
              status: 200,
              success: true,
              data: template,
            });
          else
            return res.send({
              status: 200,
              success: true,
              message: "no templates in level",
              data: {},
            });
        }
      } else {
        const template = await get({ templateOrder: 1, levelId: req.query.levelId });
        if (template) {
          return res.send({
            status: 200,
            success: true,
            data: template,
          });
        } else
          return res.send({
            status: 200,
            success: true,
            message: "no templates in level",
            data: {},
          });
      }
    } else generateError("levelId is required");
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const getNonAssesmentTypeTemplate = async (req, res) => {
  try {
    const templates = await get({ levelId: req.query.levelId });
    return res.send({
      status: 200,
      success: true,
      data: templates,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

exports.checkLevelType = (req, res) => {
  try {
    if (req.level.levelType === LEVEL_TYPE.ASSESMENT) getTemplates(req, res);
    else getNonAssesmentTypeTemplate(req, res);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

const levelComplete = async ({ levelId }) => {
  const userLevelData = await UserLevel.getLatestUserLevelByLevel({ levelId });
  if (userLevelData && userLevelData[0]) {
    const score = userLevelData[0].levelScore;
    const passState = userLevelData[0].levelStatus;
    return { score, passState };
  }
};

exports.create = async (req, res) => {
  try {
    const level = await Level.get({ id: req.body.levelId });
    const levelType = level.levelType;
    const template = await create({ ...req.body, levelType });
    res.send({
      status: 200,
      success: true,
      data: template,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `invalid template` });
  }
};

exports.deleteTemplate = async (req, res) =>
  deleteTemplate(req.body.id).then((template) =>
    template.deletedCount
      ? res.send("Template deleted")
      : res.send("Template aleready deleted or doesnt exist")
  );

exports.uploadTemplateMedia = async (req, res) => {
  try {
    const { files } = req;
    if (!files.length) res.status(400).send("No file uploaded.");
    const finalbucket =
      `${process.env.AWS_BUCKET_NAME}` +
      "/" +
      `${req.query.org}` +
      `${req.query.track}` +
      `${req.query.level}` +
      "/template";
    const uploadedFiles = await uploadFiles(finalbucket, files);
    return res.send({
      status: 200,
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `invalid file` });
  }
};

exports.getTemplates = getTemplates;
exports.updateUserState = updateUserState;
