// Express 4 does not catch rejections from async route handlers — without this
// wrapper a rejected handler becomes an unhandled rejection and kills the
// process on modern Node. Forwards errors to the global error middleware.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
