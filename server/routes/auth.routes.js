const express = require('express');
const { admin, auth, db } = require('../config/firebase');
const logger = require('../utils/logger');

const { verifyFirebaseToken } = require("../middleware/auth.middleware");
const router = express.Router();


// Get user profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    
    const userData = userDoc.data();
    
    res.status(200).json({
      success: true,
      user: {
        id: userId,
        email: req.user.email,
        displayName: req.user.name || userData.displayName,
        photoURL: req.user.picture || userData.photoURL,
        createdAt: userData.createdAt,
        preferences: userData.preferences || {}
      }
    });
  } catch (error) {
    logger.error(`Error fetching user profile: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const updateData = req.body;
    
    // Remove sensitive or immutable fields
    delete updateData.email;
    delete updateData.createdAt;
    delete updateData.id;
    
    // Update the user document
    await db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const preferences = req.body;
    
    // Update just the preferences field
    await db.collection('users').doc(userId).update({
      'preferences': preferences,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    logger.error(`Error updating user preferences: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Connect Binance API keys
router.post('/connect-binance', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { apiKey, apiSecret } = req.body;
    
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ 
        success: false, 
        message: 'API key and secret are required' 
      });
    }
    
    // Store encrypted API keys (in real app, these should be encrypted)
    await db.collection('users').doc(userId).update({
      binanceApiKey: apiKey,
      binanceApiSecret: apiSecret,
      hasBinanceConnection: true,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Binance API connected successfully'
    });
  } catch (error) {
    logger.error(`Error connecting Binance API: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
