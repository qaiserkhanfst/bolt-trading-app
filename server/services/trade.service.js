const { db } = require('../config/firebase');
const { executeBuyOrder, executeSellOrder, getCurrentPrice } = require('./binance.service');
const { checkDrawdownLimit, calculateTradeParameters } = require('./risk.service');
const logger = require('../utils/logger');

// Create a new trade
const createTrade = async (userId, tradeData) => {
  try {
    // Check risk parameters
    const drawdownCheck = await checkDrawdownLimit(userId, tradeData);
    
    if (!drawdownCheck.allowed) {
      logger.info(`Trade rejected for ${userId}: ${drawdownCheck.reason}`);
      return { success: false, message: drawdownCheck.reason };
    }
    
    // Prepare trade document
    const trade = {
      userId,
      symbol: tradeData.symbol,
      type: tradeData.type, // BUY or SELL
      amount: parseFloat(tradeData.amount),
      entryPrice: parseFloat(tradeData.entryPrice),
      targetPrice: tradeData.targetPrice ? parseFloat(tradeData.targetPrice) : null,
      stopLossPrice: tradeData.stopLossPrice ? parseFloat(tradeData.stopLossPrice) : null,
      status: 'OPEN',
      mode: tradeData.mode, // AUTO or MANUAL
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
      closedPrice: null,
      profit: null,
      profitPercent: null,
      aiAnalysis: tradeData.aiAnalysis || null
    };
    
    // Add to database
    const tradeRef = await db.collection('trades').add(trade);
    
    // Return the created trade with its ID
    return {
      success: true,
      trade: {
        id: tradeRef.id,
        ...trade
      }
    };
  } catch (error) {
    logger.error(`Error creating trade: ${error.message}`);
    throw error;
  }
};

// Execute a trade
const executeTrade = async (userId, tradeParams) => {
  try {
    const { symbol, positionSize, recommendationType } = tradeParams;
    
    // Get current price
    const currentPrice = await getCurrentPrice(symbol);
    
    // Execute the order based on recommendation
    let orderResult;
    
    if (recommendationType === 'BUY') {
      // Execute buy order with the calculated position size
      orderResult = await executeBuyOrder(symbol, parseFloat(positionSize));
      
      // Calculate average entry price from the order result
      const entryPrice = parseFloat(orderResult.fills.reduce(
        (total, fill) => total + parseFloat(fill.price) * parseFloat(fill.qty),
        0
      ) / orderResult.executedQty);
      
      // Calculate target and stop prices
      const targetPrice = entryPrice * (1 + (tradeParams.takeProfitPercent / 100));
      const stopLossPrice = entryPrice * (1 - (tradeParams.stopLossPercent / 100));
      
      // Save the trade
      const tradeData = {
        symbol,
        type: 'BUY',
        amount: parseFloat(positionSize),
        entryPrice,
        targetPrice,
        stopLossPrice,
        mode: 'AUTO', // or could be passed as parameter
        aiAnalysis: {
          recommendationType,
          takeProfitPercent: tradeParams.takeProfitPercent,
          stopLossPercent: tradeParams.stopLossPercent,
          riskScore: tradeParams.riskScore,
          rewardRiskRatio: tradeParams.rewardRiskRatio
        }
      };
      
      // Create the trade in database
      const result = await createTrade(userId, tradeData);
      
      return {
        success: true,
        trade: result.trade,
        order: orderResult
      };
    } else if (recommendationType === 'SELL') {
      // For sell recommendations we might need to check if user has the asset
      // This is just a placeholder - in reality you'd check user's balance
      return {
        success: false,
        message: 'SELL recommendations not implemented in AUTO mode'
      };
    } else {
      // HOLD recommendation
      return {
        success: true,
        message: 'HOLD recommendation - no trade executed'
      };
    }
  } catch (error) {
    logger.error(`Error executing trade: ${error.message}`);
    throw error;
  }
};

// Close a trade
const closeTrade = async (tradeId, closedPrice = null) => {
  try {
    // Get the trade
    const tradeDoc = await db.collection('trades').doc(tradeId).get();
    
    if (!tradeDoc.exists) {
      throw new Error(`Trade ${tradeId} not found`);
    }
    
    const trade = tradeDoc.data();
    
    // If trade is already closed, return
    if (trade.status !== 'OPEN') {
      return {
        success: false,
        message: `Trade ${tradeId} is already ${trade.status}`
      };
    }
    
    // If no closed price provided, get current price
    if (closedPrice === null) {
      closedPrice = await getCurrentPrice(trade.symbol);
    }
    
    // Calculate profit
    let profit = 0;
    let profitPercent = 0;
    
    if (trade.type === 'BUY') {
      profit = (closedPrice - trade.entryPrice) * trade.amount;
      profitPercent = ((closedPrice - trade.entryPrice) / trade.entryPrice) * 100;
    } else {
      // For SELL (short) trades
      profit = (trade.entryPrice - closedPrice) * trade.amount;
      profitPercent = ((trade.entryPrice - closedPrice) / trade.entryPrice) * 100;
    }
    
    // Update the trade
    await db.collection('trades').doc(tradeId).update({
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      closedPrice,
      profit,
      profitPercent,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      trade: {
        id: tradeId,
        ...trade,
        status: 'CLOSED',
        closedAt: new Date().toISOString(),
        closedPrice,
        profit,
        profitPercent
      }
    };
  } catch (error) {
    logger.error(`Error closing trade: ${error.message}`);
    throw error;
  }
};

// Get user's trades
const getUserTrades = async (userId, status = null, limit = 20) => {
  try {
    let query = db.collection('trades').where('userId', '==', userId);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();
    
    const trades = [];
    snapshot.forEach(doc => {
      trades.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return trades;
  } catch (error) {
    logger.error(`Error fetching user trades: ${error.message}`);
    throw error;
  }
};

// Check if trade needs to be closed (hit TP or SL)
const checkTradeStatus = async (trade) => {
  try {
    // If trade is not open, no need to check
    if (trade.status !== 'OPEN') {
      return trade;
    }
    
    // Get current price
    const currentPrice = await getCurrentPrice(trade.symbol);
    
    // Check if take profit hit
    if (trade.targetPrice && 
        ((trade.type === 'BUY' && currentPrice >= trade.targetPrice) ||
         (trade.type === 'SELL' && currentPrice <= trade.targetPrice))) {
      
      // Close trade at target price
      const result = await closeTrade(trade.id, trade.targetPrice);
      
      return {
        ...result.trade,
        closeReason: 'TAKE_PROFIT'
      };
    }
    
    // Check if stop loss hit
    if (trade.stopLossPrice && 
        ((trade.type === 'BUY' && currentPrice <= trade.stopLossPrice) ||
         (trade.type === 'SELL' && currentPrice >= trade.stopLossPrice))) {
      
      // Close trade at stop loss price
      const result = await closeTrade(trade.id, trade.stopLossPrice);
      
      return {
        ...result.trade,
        closeReason: 'STOP_LOSS'
      };
    }
    
    // Trade remains open
    return {
      ...trade,
      currentPrice
    };
  } catch (error) {
    logger.error(`Error checking trade status: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createTrade,
  executeTrade,
  closeTrade,
  getUserTrades,
  checkTradeStatus
};