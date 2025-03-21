const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // Should match the one in auth.js

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied: No token provided' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Access denied: Invalid token' });
  }
};

const checkAdmin = (req, res, next) => {
  console.log('checkAdmin middleware running with user:', req.user);
  
  if (req.user && req.user.userType === 'admin') {
    console.log('Admin check passed');
    next();
  } else {
    console.log('Admin check failed, userType:', req.user?.userType);
    res.status(403).json({ message: 'Access denied: Admin privileges required', user: req.user });
  }
};

module.exports = { authenticateToken, checkAdmin };