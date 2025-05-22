const express = require('express');
const { db } = require('../config/firebase');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware for verifying tokens
const authMiddleware = require('../middleware/auth.middleware');

// Get user settings
router.get('/settings', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Only return settings data, not sensitive information
    const settings = {
      tradingMode: userData.tradingMode || 'MANUAL',
      defaultRiskPercent: userData.defaultRiskPercent || 2,
      notificationsEnabled: userData.notificationsEnabled !== false, // default to true
      emailNotifications: userData.emailNotifications || false,
      theme: userData.theme || 'dark',
      defaultSymbols: userData.defaultSymbols || ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
      hasBinanceConnection: userData.hasBinanceConnection || false
    };
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    logger.error(`Error fetching user settings: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const settings = req.body;
    
    // Validate some settings
    if (settings.defaultRiskPercent && (settings.defaultRiskPercent < 0.1 || settings.defaultRiskPercent > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Default risk percent must be between 0.1 and 10'
      });
    }
    
    // Update the settings
    await db.collection('users').doc(userId).update({
      ...settings,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    logger.error(`Error updating user settings: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user statistics
router.get('/statistics', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get all completed trades
    const tradesSnapshot = await db.collection('trades')
      .where('userId', '==', userId)
      .where('status', '==', 'CLOSED')
      .get();
    
    if (tradesSnapshot.empty) {
      return res.status(200).json({
        success: true,
        data: {
          totalTrades: 0,
          winRate: 0,
          avgProfit: 0,
          totalProfit: 0,
          bestTrade: null,
          worstTrade: null
        }
      });
    }
    
    // Calculate statistics
    let totalProfit = 0;
    let winCount = 0;
    let bestTrade = null;
    let worstTrade = null;
    
    const trades = [];
    tradesSnapshot.forEach(doc => {
      const trade = { id: doc.id, ...doc.data() };
      trades.push(trade);
      
      totalProfit += trade.profit || 0;
      
      if (trade.profit > 0) {
        winCount++;
      }
      
      // Track best trade
      if (!bestTrade || (trade.profit > bestTrade.profit)) {
        bestTrade = trade;
      }
      
      // Track worst trade
      if (!worstTrade || (trade.profit < worstTrade.profit)) {
        worstTrade = trade;
      }
    });
    
    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades * 100) : 0;
    const avgProfit = totalTrades > 0 ? (totalProfit / totalTrades) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalTrades,
        winRate: winRate.toFixed(2),
        avgProfit: avgProfit.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        bestTrade,
        worstTrade
      }
    });
  } catch (error) {
    logger.error(`Error fetching user statistics: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;