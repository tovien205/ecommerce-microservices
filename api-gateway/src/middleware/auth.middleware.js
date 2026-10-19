const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Lỗi xác thực: Thiếu Token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded; // { userId, email, role }
    
    // Pass user info sang downstream services qua HTTP Headers
    req.headers['x-user-id'] = decoded.userId || decoded.id || '';
    req.headers['x-user-role'] = decoded.role || 'USER';

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
  };
};

module.exports = { authenticateJWT, authorizeRoles };
