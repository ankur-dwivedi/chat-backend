const {
  get,
  create,
  deleteTemplate,
  countTemplateInLevel,
  updateTemplateOrder,
  update,
} = require("../../models/template/services");
const UserLevel = require("../../models/userLevel/services");
const { generateError } = require("../../utils/error");
const { uploadFiles } = require(".././../libs/aws/upload");
const User = require("../../models/user/services");
const { Types } = require("mongoose");
const { LEVEL_TYPE } = require("../../models/level/constants");
const Level = require("../../models/level/services");
const Feedback = require("../../models/feedback/services");
const { ATTEMPT_STATUS } = require("../../models/userLevel/constants");
const Journey = require("../../models/journey/services");

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
      if (req.user.currentState && req.user.currentState.level != req.query.levelId) {
        const userLevelData = await UserLevel.get({
          levelId: req.query.levelId,
          attemptStatus: ATTEMPT_STATUS.ACTIVE,
          learnerId: req.user._id,
        });
        if (userLevelData && userLevelData.lastAttemptedTemplate) {
          req.user.currentState.level = req.query.levelId;
          req.user.currentState.completed = false;
          req.user.currentState.template = userLevelData.lastAttemptedTemplate;
        }
      }
      if (
        req.user.currentState &&
        req.user.currentState.level == req.query.levelId &&
        req.user.currentState.completed === false
      ) {
        const prevTemplate = await get({ id: req.user.currentState.template });
        if (prevTemplate && prevTemplate.templateOrder) {
          const templateOrder = prevTemplate.templateOrder + 1;
          const template = await get({ templateOrder, levelId: req.user.currentState.level });
          if (template && template.length)
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
            const levelCompleteData = await levelComplete({
              levelId: req.query.levelId,
              learnerId: req.user._id,
            });
            return res.send({
              status: 200,
              success: true,
              message: "level completed",
              data: { ...levelCompleteData },
            });
          }
        } else {
          const template = await get({ templateOrder: 1, levelId: req.query.levelId });
          if (template && template.length)
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
        if (template && template.length) {
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
    // check if active attempt exists
    const userLevelData = await UserLevel.get({
      levelId: req.query.levelId,
      attemptStatus: ATTEMPT_STATUS.ACTIVE,
      learnerId: req.user._id,
    });
    let templates = await get({ levelId: req.query.levelId });
    if (userLevelData) {
      templates = templates.map(async (data) => {
        return {
          ...JSON.parse(JSON.stringify(data)),
          completed: (await Journey.get({ attemptId: userLevelData._id, templateId: data._id }))
            ? true
            : false,
        };
      });
      templates = await Promise.all(templates);
    }
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

const levelComplete = async ({ levelId, learnerId }) => {
  const userLevelData = await UserLevel.getLatestUserLevelByLevel({ levelId, learnerId });
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
    console.log({ files });
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

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      levelId: req.template.levelId,
      learnerId: req.user._id,
    });
    res.json({ message: `feedback saved successflly` });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: `invalid data` });
  }
};
exports.templateCount = async (req, res) => {
  return res.send({ templateCount: await countTemplateInLevel({ levelId: req.query.levelId }) });
};

exports.getCreatorTemplate = async (req, res) => {
  const template = await get({ levelId: req.query.levelId });
  return res.send({
    status: 200,
    success: true,
    data: template,
  });
};

exports.templateOrder = async (req, res) => {
  try {
    const tempBulkOps = req.body.templateData.map((data) => {
      return {
        updateOne: {
          filter: { _id: data.templateId, levelId: req.body.levelId },
          update: { $set: { templateOrder: data.templateOrder * -99999 } },
          upsert: true,
        },
      };
    });
    await updateTemplateOrder({ bulkOps: tempBulkOps });
    const bulkOps = req.body.templateData.map((data) => {
      return {
        updateOne: {
          filter: { _id: data.templateId, levelId: req.body.levelId },
          update: { $set: { templateOrder: data.templateOrder } },
          upsert: true,
        },
      };
    });
    const update = await updateTemplateOrder({ bulkOps });
    return res.send({
      status: 200,
      success: true,
      data: update,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const queryObject = {
    $and: [{ _id: req.body.id }, { levelId: req.body.levelId }],
  };
  const updateObject = { ...req.body };
  delete updateObject.id;
  const updateTemplate = await update(queryObject, updateObject).then((level) => ({
    status: 200,
    success: true,
    data: level,
  }));
  return res.send(updateTemplate);
};

exports.getTemplates = getTemplates;
exports.updateUserState = updateUserState;
