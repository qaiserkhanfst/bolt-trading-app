const express = require('express');
const { executeTrade, getUserTrades, closeTrade } = require('../services/trade.service');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware for verifying tokens
const authMiddleware = require('../middleware/auth.middleware');

// Execute a trade (auto mode)
router.post('/execute', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const tradeParams = req.body;
    
    const result = await executeTrade(userId, tradeParams);
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Error executing trade: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's trades
router.get('/user-trades', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const status = req.query.status; // Optional status filter
    const limit = parseInt(req.query.limit || '20');
    
    const trades = await getUserTrades(userId, status, limit);
    
    res.status(200).json({ success: true, data: trades });
  } catch (error) {
    logger.error(`Error fetching user trades: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Close a specific trade
router.post('/close/:tradeId', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const closedPrice = req.body.closedPrice; // Optional, if not provided will use current price
    
    const result = await closeTrade(tradeId, closedPrice);
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error(`Error closing trade: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;