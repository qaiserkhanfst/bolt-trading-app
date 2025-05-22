const express = require('express');
const { getSymbols, getKlines, getCurrentPrice } = require('../services/binance.service');
const logger = require('../utils/logger');

const router = express.Router();

// Get all available trading symbols
router.get('/symbols', async (req, res) => {
  try {
    const symbols = await getSymbols();
    res.status(200).json({ success: true, data: symbols });
  } catch (error) {
    logger.error(`Error fetching symbols: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get candlestick data for a symbol
router.get('/klines/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = req.query.interval || '1h';
    const limit = parseInt(req.query.limit || '100');
    
    const klines = await getKlines(symbol, interval, limit);
    res.status(200).json({ success: true, data: klines });
  } catch (error) {
    logger.error(`Error fetching klines: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current price for a symbol
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await getCurrentPrice(symbol);
    res.status(200).json({ success: true, data: { symbol, price } });
  } catch (error) {
    logger.error(`Error fetching price: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get multiple prices
router.get('/prices', async (req, res) => {
  try {
    const symbols = req.query.symbols?.split(',') || ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
    
    const prices = await Promise.all(
      symbols.map(async (symbol) => {
        const price = await getCurrentPrice(symbol);
        return { symbol, price };
      })
    );
    
    res.status(200).json({ success: true, data: prices });
  } catch (error) {
    logger.error(`Error fetching multiple prices: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;