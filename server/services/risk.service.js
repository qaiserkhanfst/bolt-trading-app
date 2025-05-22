const dotenv = require('dotenv');
const { getAccountInfo } = require('./binance.service');
const logger = require('../utils/logger');

dotenv.config();

// Get user account balance (total USDT)
const getTotalBalance = async () => {
  try {
    const accountInfo = await getAccountInfo();
    
    // Find USDT balance
    const usdtBalance = accountInfo.balances.find(
      balance => balance.asset === 'USDT'
    );
    
    if (!usdtBalance) {
      return 0;
    }
    
    return parseFloat(usdtBalance.free);
  } catch (error) {
    logger.error(`Error getting total balance: ${error.message}`);
    throw error;
  }
};

// Calculate position size using Kelly Criterion
const calculateKellyPositionSize = (winRate, winLossRatio, balance) => {
  // Kelly formula: f* = (p * (b + 1) - 1) / b
  // where: f* = fraction of bankroll to bet
  //        p = probability of winning
  //        b = net odds received on the bet (winnings/stake)
  
  const fraction = (winRate * (winLossRatio + 1) - 1) / winLossRatio;
  
  // Kelly often suggests aggressive position sizes, so we use a fraction of it
  const adjustedFraction = Math.max(0, fraction * 0.5); // Half-Kelly for safer betting
  
  // Ensure the position size doesn't exceed max exposure
  const maxPositionPercent = parseFloat(process.env.MAX_EXPOSURE_PERCENT) / 100;
  const finalFraction = Math.min(adjustedFraction, maxPositionPercent);
  
  return balance * finalFraction;
};

// Calculate fixed fractional position size
const calculateFixedFractionPosition = (riskScore, balance) => {
  // Base percentage from env variable
  const basePercent = parseFloat(process.env.DEFAULT_POSITION_SIZE_PERCENT) / 100;
  
  // Adjust based on risk score (1-10)
  // Lower risk scores increase position size, higher risk scores decrease it
  const adjustmentFactor = 1 - ((riskScore - 1) / 10);
  
  // Calculate adjusted percentage
  const adjustedPercent = basePercent * adjustmentFactor;
  
  // Ensure max exposure isn't exceeded
  const maxPositionPercent = parseFloat(process.env.MAX_EXPOSURE_PERCENT) / 100;
  const finalPercent = Math.min(adjustedPercent, maxPositionPercent);
  
  return balance * finalPercent;
};

// Calculate stop loss price based on ATR (Average True Range)
const calculateATRStopLoss = (price, atr, multiplier = 3) => {
  return price - (atr * multiplier);
};

// Check daily drawdown limit
const checkDrawdownLimit = async (userId, newTrade) => {
  try {
    // Get max daily drawdown percentage from env
    const maxDailyDrawdown = parseFloat(process.env.MAX_DAILY_DRAWDOWN) / 100;
    
    // Get starting balance for the day from database
    // This would be implemented with Firebase Firestore
    const startingDailyBalance = 10000; // Placeholder, would come from DB
    
    // Get current total balance
    const currentBalance = await getTotalBalance();
    
    // Calculate current drawdown
    const currentDrawdown = (startingDailyBalance - currentBalance) / startingDailyBalance;
    
    // Check if new trade would potentially exceed the limit
    const worstCaseDrawdown = currentDrawdown + (newTrade.riskAmount / startingDailyBalance);
    
    if (worstCaseDrawdown > maxDailyDrawdown) {
      return {
        allowed: false,
        reason: `Trade rejected: Would exceed max daily drawdown of ${maxDailyDrawdown * 100}%`,
        currentDrawdown: currentDrawdown * 100,
        maxDailyDrawdown: maxDailyDrawdown * 100
      };
    }
    
    return {
      allowed: true,
      currentDrawdown: currentDrawdown * 100,
      maxDailyDrawdown: maxDailyDrawdown * 100
    };
  } catch (error) {
    logger.error(`Error checking drawdown limit: ${error.message}`);
    throw error;
  }
};

// Calculate trade parameters based on analysis and risk management
const calculateTradeParameters = async (symbol, analysis) => {
  try {
    // Get account balance
    const balance = await getTotalBalance();
    
    // Extract parameters from analysis
    const { recommendation, takeProfitPercent, stopLossPercent, riskScore } = analysis;
    
    // Only calculate for BUY recommendations
    if (recommendation !== 'BUY') {
      return null;
    }
    
    // Calculate reward to risk ratio
    const rewardRiskRatio = takeProfitPercent / stopLossPercent;
    
    // Set win rate based on risk score (lower risk score = higher expected win rate)
    const winRate = 0.6 - ((riskScore - 1) / 25); // Ranges from 0.64 to 0.24
    
    // Calculate position sizes using different methods
    const kellySize = calculateKellyPositionSize(winRate, rewardRiskRatio, balance);
    const fixedFractionSize = calculateFixedFractionPosition(riskScore, balance);
    
    // Use the more conservative of the two
    const positionSize = Math.min(kellySize, fixedFractionSize);
    
    // Calculate risk amount (what we're willing to lose)
    const riskAmount = (positionSize * stopLossPercent) / 100;
    
    return {
      symbol,
      recommendationType: recommendation,
      positionSize: positionSize.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      takeProfitPercent,
      stopLossPercent,
      rewardRiskRatio: rewardRiskRatio.toFixed(2),
      riskScore
    };
  } catch (error) {
    logger.error(`Error calculating trade parameters: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getTotalBalance,
  calculateKellyPositionSize,
  calculateFixedFractionPosition,
  calculateATRStopLoss,
  checkDrawdownLimit,
  calculateTradeParameters
};