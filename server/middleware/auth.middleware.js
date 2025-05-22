const { admin } = require('../config/firebase');
const logger = require('../utils/logger');

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = {
  verifyFirebaseToken
};