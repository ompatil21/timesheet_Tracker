// Global error middleware. Controllers signal intentional errors with
// `res.status(4xx); throw new Error('message')` — honour that status.
// Anything else is an unexpected 500: log it, return a generic message
// so internals (DB errors, stack details) never reach the client.
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);
    return res.status(statusCode).json({ message: 'Server error' });
  }
  res.status(statusCode).json({ message: err.message });
};

module.exports = errorHandler;
