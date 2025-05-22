import { useState } from 'react';
import { executeTrade } from '../../services/tradeService';
import toast from 'react-hot-toast';

const RiskCalculator = ({ analysis, tradeParams }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [customStopLoss, setCustomStopLoss] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [customRiskParams, setCustomRiskParams] = useState(null);
  const [executingTrade, setExecutingTrade] = useState(false);
  
  // Calculate custom risk parameters
  const calculateCustomRisk = () => {
    if (!customAmount || !customStopLoss || !analysis) {
      toast.error('Please enter both amount and stop loss percentage');
      return;
    }
    
    setIsCalculating(true);
    
    try {
      const amount = parseFloat(customAmount);
      const stopLossPercent = parseFloat(customStopLoss);
      
      if (isNaN(amount) || isNaN(stopLossPercent)) {
        toast.error('Please enter valid numbers');
        return;
      }
      
      if (amount <= 0 || stopLossPercent <= 0) {
        toast.error('Values must be greater than zero');
        return;
      }
      
      const currentPrice = analysis.marketData.price;
      const takeProfitPercent = analysis.analysis.takeProfitPercent;
      
      // Calculate risk amount
      const riskAmount = (amount * stopLossPercent) / 100;
      
      // Calculate reward amount
      const rewardAmount = (amount * takeProfitPercent) / 100;
      
      // Calculate reward/risk ratio
      const rewardRiskRatio = takeProfitPercent / stopLossPercent;
      
      // Calculate stop loss price
      const stopLossPrice = currentPrice * (1 - (stopLossPercent / 100));
      
      // Calculate take profit price
      const takeProfitPrice = currentPrice * (1 + (takeProfitPercent / 100));
      
      setCustomRiskParams({
        symbol: analysis.symbol,
        recommendationType: 'BUY',
        positionSize: amount.toFixed(2),
        riskAmount: riskAmount.toFixed(2),
        rewardAmount: rewardAmount.toFixed(2),
        rewardRiskRatio: rewardRiskRatio.toFixed(2),
        takeProfitPercent: takeProfitPercent,
        stopLossPercent: stopLossPercent,
        stopLossPrice: stopLossPrice.toFixed(2),
        takeProfitPrice: takeProfitPrice.toFixed(2),
        riskScore: analysis.analysis.riskScore
      });
    } catch (error) {
      console.error('Error calculating custom risk:', error);
      toast.error('An error occurred during calculation');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Execute trade with custom parameters
  const executeCustomTrade = async () => {
    if (!customRiskParams) {
      toast.error('Please calculate risk parameters first');
      return;
    }
    
    try {
      setExecutingTrade(true);
      
      // Execute the trade
      const result = await executeTrade(customRiskParams);
      
      if (result.success) {
        toast.success('Trade executed successfully!');
        setCustomAmount('');
        setCustomStopLoss('');
        setCustomRiskParams(null);
      } else {
        toast.error(result.message || 'Failed to execute trade');
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast.error('An error occurred while executing the trade');
    } finally {
      setExecutingTrade(false);
    }
  };
  
  // Execute recommended trade
  const executeRecommendedTrade = async () => {
    if (!tradeParams) {
      toast.error('No valid trade parameters available');
      return;
    }
    
    try {
      setExecutingTrade(true);
      
      // Execute the trade
      const result = await executeTrade(tradeParams);
      
      if (result.success) {
        toast.success('Trade executed successfully!');
      } else {
        toast.error(result.message || 'Failed to execute trade');
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast.error('An error occurred while executing the trade');
    } finally {
      setExecutingTrade(false);
    }
  };
  
  if (!analysis) {
    return (
      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-white mb-4">Risk Analysis & Position Sizing</h2>
        <div className="text-gray-400">No analysis data available</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-card">
      <h2 className="text-xl font-bold text-white mb-6">Risk Analysis & Position Sizing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Recommended Parameters */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">AI Recommended Parameters</h3>
          
          {analysis.analysis.recommendation === 'BUY' && tradeParams ? (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Position Size</span>
                  <span className="text-white">${tradeParams.positionSize}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Amount</span>
                  <span className="text-white">${tradeParams.riskAmount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Take Profit %</span>
                  <span className="text-green-500">+{analysis.analysis.takeProfitPercent}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Loss %</span>
                  <span className="text-red-500">-{analysis.analysis.stopLossPercent}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Take Profit Price</span>
                  <span className="text-green-500">${analysis.analysis.takeProfitPrice}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Loss Price</span>
                  <span className="text-red-500">${analysis.analysis.stopLossPrice}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Reward/Risk Ratio</span>
                  <span className="text-white">{tradeParams.rewardRiskRatio}</span>
                </div>
              </div>
              
              <button
                onClick={executeRecommendedTrade}
                disabled={executingTrade}
                className="btn-success w-full"
              >
                {executingTrade ? (
                  <>
                    <div className="loading-spinner mr-2 !h-4 !w-4"></div>
                    Executing Trade...
                  </>
                ) : (
                  <>Execute Trade</>
                )}
              </button>
            </>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-400">
              {analysis.analysis.recommendation === 'SELL' ? (
                <>AI recommends SELL. Auto position sizing is only available for BUY signals.</>
              ) : analysis.analysis.recommendation === 'HOLD' ? (
                <>AI recommends HOLD. No position sizing available.</>
              ) : (
                <>Could not calculate trade parameters.</>
              )}
            </div>
          )}
        </div>
        
        {/* Custom Parameters */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Custom Parameters</h3>
          
          <div className="mb-4">
            <label htmlFor="customAmount" className="form-label">Position Size (USDT)</label>
            <input
              id="customAmount"
              type="number"
              min="0"
              step="any"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="form-input w-full"
              placeholder="Enter amount in USDT"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="customStopLoss" className="form-label">Stop Loss (%)</label>
            <input
              id="customStopLoss"
              type="number"
              min="0.1"
              step="0.1"
              value={customStopLoss}
              onChange={(e) => setCustomStopLoss(e.target.value)}
              className="form-input w-full"
              placeholder="Enter stop loss percentage"
            />
          </div>
          
          <button
            onClick={calculateCustomRisk}
            disabled={isCalculating}
            className="btn-secondary w-full mb-4"
          >
            {isCalculating ? (
              <>
                <div className="loading-spinner mr-2 !h-4 !w-4"></div>
                Calculating...
              </>
            ) : (
              <>Calculate Risk Parameters</>
            )}
          </button>
          
          {customRiskParams && (
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Custom Risk Results</h4>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Position Size</span>
                  <span className="text-white">${customRiskParams.positionSize}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Amount</span>
                  <span className="text-white">${customRiskParams.riskAmount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Reward Amount</span>
                  <span className="text-white">${customRiskParams.rewardAmount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Take Profit Price</span>
                  <span className="text-green-500">${customRiskParams.takeProfitPrice}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Loss Price</span>
                  <span className="text-red-500">${customRiskParams.stopLossPrice}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Reward/Risk Ratio</span>
                  <span className="text-white">{customRiskParams.rewardRiskRatio}</span>
                </div>
              </div>
              
              <button
                onClick={executeCustomTrade}
                disabled={executingTrade}
                className="btn-success w-full"
              >
                {executingTrade ? (
                  <>
                    <div className="loading-spinner mr-2 !h-4 !w-4"></div>
                    Executing Custom Trade...
                  </>
                ) : (
                  <>Execute Custom Trade</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;