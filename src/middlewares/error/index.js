

const errorHandlerMiddleware = (error, req, res, next) => {
    if (res.headersSent) {
    return next(error);
  }

  return res
    .status(error.status || 500)
    .json({ error: { message: error.message } });
};

module.exports = { errorHandlerMiddleware };
