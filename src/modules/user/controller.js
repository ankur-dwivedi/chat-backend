const bcrypt = require('bcrypt');
const {
  get,
  create,
  passwordCompare,
} = require('../../models/user/services');
const { generateError } = require('../../utils/error');
const {
  generateAccessToken,
} = require('../../utils/general');

exports.getUsers = async (req, res) =>
    res.send({
      status: 200,
      success: true,
      data: req.user,
    });


exports.register = async (req, res) => {
  try {
    const userData = await create({...req.body});
    res.send({
      status: 200,
      success: true,
      data: userData,
    });
  } catch (err) {
      res.status(400).send({ message: err.message });
  }
};

exports.login = (req, res) => {
  return get({ email:req.body.email })
    .then((user) => {
      const { password, ...userData } = user;
      if (password === undefined) {
        return generateError();
      }
      return user
        ? passwordCompare(req.body.password, password).then((match) =>
            match
              ? res.send({
                  status: 200,
                  success: true,
                  data: {
                    ...JSON.parse(JSON.stringify(user)),
                    accessToken: generateAccessToken(user._id),
                  },
                })
              : generateError()
          )
        : generateError();
    })
    .catch((err) => {
res.status(400).send({ message: err.message });
    });
};

