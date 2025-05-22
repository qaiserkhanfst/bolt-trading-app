import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { executeTrade } from '../../services/tradeService';
import toast from 'react-hot-toast';

const AIRecommendation = ({ analysis, tradeParams }) => {
  const { currentUser } = useAuth();
  const [executing, setExecuting] = useState(false);
  
  const handleExecuteTrade = async () => {
    if (!tradeParams) {
      toast.error('No valid trade parameters available');
      return;
    }
    
    try {
      setExecuting(true);
      
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
      setExecuting(false);
    }
  };
  
  const renderSignalIndicator = (recommendation) => {
    if (!recommendation) return null;
    
    if (recommendation === 'BUY') {
      return (
        <div className="flex items-center">
          <div className="signal-buy animate-pulse-blue">BUY</div>
          <ArrowUpIcon className="h-5 w-5 text-green-500 ml-2" />
        </div>
      );
    } else if (recommendation === 'SELL') {
      return (
        <div className="flex items-center">
          <div className="signal-sell animate-pulse-blue">SELL</div>
          <ArrowDownIcon className="h-5 w-5 text-red-500 ml-2" />
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <div className="signal-hold">HOLD</div>
          <MinusIcon className="h-5 w-5 text-amber-500 ml-2" />
        </div>
      );
    }
  };
  
  if (!analysis) {
    return (
      <div className="dashboard-card h-full">
        <h2 className="text-xl font-bold text-white mb-4">AI Recommendation</h2>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-400">No analysis data available</p>
        </div>
      </div>
    );
  }
  
  const { analysis: aiAnalysis } = analysis;
  
  return (
    <div className="dashboard-card h-full">
      <h2 className="text-xl font-bold text-white mb-4">AI Recommendation</h2>
      
      <div className="mb-5">
        <div className="flex justify-between mb-3">
          <span className="text-gray-400">Signal</span>
          <div className="text-right">
            {renderSignalIndicator(aiAnalysis.recommendation)}
          </div>
        </div>
        
        <div className="flex justify-between mb-3">
          <span className="text-gray-400">Take Profit</span>
          <span className="text-green-500">${aiAnalysis.takeProfitPrice} (+{aiAnalysis.takeProfitPercent}%)</span>
        </div>
        
        <div className="flex justify-between mb-3">
          <span className="text-gray-400">Stop Loss</span>
          <span className="text-red-500">${aiAnalysis.stopLossPrice} (-{aiAnalysis.stopLossPercent}%)</span>
        </div>
        
        <div className="flex justify-between mb-4">
          <span className="text-gray-400">Risk Score</span>
          <div className="flex items-center">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mr-2">
              <div 
                className={`h-full rounded-full ${
                  aiAnalysis.riskScore <= 3 ? 'bg-green-500' : 
                  aiAnalysis.riskScore <= 7 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${(aiAnalysis.riskScore / 10) * 100}%` }}
              ></div>
            </div>
            <span className="text-gray-300">{aiAnalysis.riskScore}/10</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-700/50 rounded-lg mb-6">
        <h3 className="text-white font-medium mb-2">AI Analysis</h3>
        <p className="text-gray-300">{aiAnalysis.explanation}</p>
      </div>
      
      {tradeParams && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Trade Parameters</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Position Size</span>
              <span className="text-white">${tradeParams.positionSize}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Amount</span>
              <span className="text-white">${tradeParams.riskAmount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Reward/Risk</span>
              <span className="text-white">{tradeParams.rewardRiskRatio}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col space-y-3">
        {aiAnalysis.recommendation === 'BUY' && tradeParams && (
          <button
            onClick={handleExecuteTrade}
            disabled={executing}
            className="btn-success"
          >
            {executing ? (
              <>
                <div className="loading-spinner mr-2 !h-4 !w-4"></div>
                Executing Trade...
              </>
            ) : (
              <>Execute Trade (${tradeParams.positionSize})</>
            )}
          </button>
        )}
        
        <Link 
          to={`/trading?symbol=${analysis.symbol}`}
          className="btn-outline"
        >
          Go to Trading View
        </Link>
      </div>
    </div>
  );
};

export default AIRecommendation;