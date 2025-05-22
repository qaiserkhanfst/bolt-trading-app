import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';
import { analyzeCoin } from '../../services/analysisService';

const TradingSignals = ({ selectedCoin }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCoin) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const analysisData = await analyzeCoin(selectedCoin);
        setAnalysis(analysisData);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
    
    // Set up an interval to refresh every 5 minutes
    const intervalId = setInterval(fetchAnalysis, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedCoin]);
  
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
  
  if (loading) {
    return (
      <div className="dashboard-card h-full">
        <h2 className="text-xl font-bold text-white mb-4">AI Trading Signals</h2>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="loading-spinner mb-3"></div>
          <p className="text-gray-400">Analyzing {selectedCoin}...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-card h-full">
        <h2 className="text-xl font-bold text-white mb-4">AI Trading Signals</h2>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="p-3 rounded-full bg-red-500/20 mb-3">
            <ArrowDownIcon className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-red-400 mb-2">{error}</p>
          <button 
            className="text-blue-500 hover:text-blue-400"
            onClick={() => setLoading(true)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  if (!analysis || !analysis.analysis) {
    return (
      <div className="dashboard-card h-full">
        <h2 className="text-xl font-bold text-white mb-4">AI Trading Signals</h2>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-400">No analysis available for {selectedCoin}</p>
        </div>
      </div>
    );
  }
  
  const { analysis: aiAnalysis, marketData, technicalIndicators, sentiment } = analysis;
  
  return (
    <div className="dashboard-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">AI Trading Signals</h2>
        <Link to={`/analysis/${selectedCoin}`} className="text-blue-500 hover:text-blue-400 text-sm">
          Full analysis
        </Link>
      </div>
      
      <div className="flex items-center mb-6">
        <img 
          src={`https://cryptoicons.org/api/icon/${selectedCoin.replace('USDT', '').toLowerCase()}/30`} 
          alt={selectedCoin} 
          className="w-8 h-8 mr-3"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/30?text=' + selectedCoin.replace('USDT', '') }}
        />
        <div>
          <h3 className="text-lg font-bold text-white">{selectedCoin.replace('USDT', '')}/USDT</h3>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">${marketData?.price?.toFixed(2)}</span>
            <span className={parseFloat(marketData?.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}>
              {parseFloat(marketData?.priceChangePercent) >= 0 ? '+' : ''}{marketData?.priceChangePercent}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Signal</span>
          <div className="text-right">
            {renderSignalIndicator(aiAnalysis.recommendation)}
          </div>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Take Profit</span>
          <span className="text-green-500">${aiAnalysis.takeProfitPrice} (+{aiAnalysis.takeProfitPercent}%)</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Stop Loss</span>
          <span className="text-red-500">${aiAnalysis.stopLossPrice} (-{aiAnalysis.stopLossPercent}%)</span>
        </div>
        
        <div className="flex justify-between">
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
      
      <div className="p-3 bg-gray-700/50 rounded-lg mb-4">
        <h4 className="text-white font-medium mb-2">AI Analysis</h4>
        <p className="text-gray-300 text-sm">{aiAnalysis.explanation}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-700/30 p-3 rounded-lg">
          <h4 className="text-gray-400 text-xs mb-1">RSI (14)</h4>
          <div className="flex items-center">
            <div className="text-white font-medium">{technicalIndicators?.rsi?.toFixed(1)}</div>
            <div 
              className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                technicalIndicators?.rsi < 30 ? 'bg-green-500/20 text-green-500' : 
                technicalIndicators?.rsi > 70 ? 'bg-red-500/20 text-red-500' : 
                'bg-gray-500/20 text-gray-400'
              }`}
            >
              {technicalIndicators?.rsi < 30 ? 'Oversold' : 
               technicalIndicators?.rsi > 70 ? 'Overbought' : 'Neutral'}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700/30 p-3 rounded-lg">
          <h4 className="text-gray-400 text-xs mb-1">News Sentiment</h4>
          <div className="flex items-center">
            <div className="text-white font-medium capitalize">{sentiment?.sentiment}</div>
            <div 
              className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                sentiment?.sentiment === 'positive' ? 'bg-green-500/20 text-green-500' : 
                sentiment?.sentiment === 'negative' ? 'bg-red-500/20 text-red-500' : 
                'bg-amber-500/20 text-amber-400'
              }`}
            >
              {sentiment?.articles?.length || 0} articles
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-5">
        <Link 
          to={`/trading?symbol=${selectedCoin}`}
          className="btn-primary w-full"
        >
          Trade {selectedCoin.replace('USDT', '')}
        </Link>
      </div>
    </div>
  );
};

export default TradingSignals;