exports.validate = (schema) => {
  return async (req, res, next) => {
    try {
      const submitData = { ...req.body };
      await schema.validateAsync(submitData);
      next();
    } catch (err) {
      if (err && err.details && err.details[0] && err.details[0].message)
        return res.status(400).send(err.details[0].message);
      return err;
    }
  };
};
