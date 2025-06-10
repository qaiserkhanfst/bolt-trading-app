const express = require('express');
const { analyzeCoin } = require('../services/analysis.service');
const { calculateTradeParameters } = require('../services/risk.service');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware for verifying tokens
const authMiddleware = require('../middleware/auth.middleware');

// Analyze a specific coin
router.get('/coin/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const analysis = await analyzeCoin(symbol);
    
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    logger.error(`Error analyzing coin: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get trade parameters based on analysis
router.get('/trade-parameters/:symbol', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.user.uid;
    
    // First, get the analysis
    const analysis = await analyzeCoin(symbol);
    
    // Then calculate trade parameters
    const tradeParameters = await calculateTradeParameters(symbol, analysis.analysis);
    
    res.status(200).json({ 
      success: true, 
      data: {
        analysis: analysis,
        tradeParameters: tradeParameters
      }
    });
  } catch (error) {
    logger.error(`Error calculating trade parameters: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
