const { get, create } = require('../../models/message/services');

exports.createMessage = async (req, res) => {
  try {
    const messageData = await create({ ...req.body, sender: req.user._id });
    res.send({
      status: 200,
      success: true,
      data: messageData,
    });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

exports.getMessage = async (req, res) => {
  try {
    const messageData = await get({ ...req.query });
    res.send({
      status: 200,
      success: true,
      data: messageData,
    });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};
