const errorHandler = (err, req, res, next) => {
  console.error('Gateway Error:', err);
  return res.status(err.status || 500).json({
    message: err.message || 'Lỗi máy chủ API Gateway',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};

module.exports = errorHandler;
