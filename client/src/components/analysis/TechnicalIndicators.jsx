import { useState } from 'react';

const TechnicalIndicators = ({ analysis }) => {
  const [showDetails, setShowDetails] = useState({});
  
  // Toggle details section
  const toggleDetails = (section) => {
    setShowDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // RSI analysis
  const getRSIAnalysis = (rsi) => {
    if (rsi < 30) {
      return {
        status: 'Oversold',
        description: 'RSI below 30 indicates an oversold condition, which might signal a potential buying opportunity.',
        class: 'text-green-500',
        bgClass: 'bg-green-500/20'
      };
    } else if (rsi > 70) {
      return {
        status: 'Overbought',
        description: 'RSI above 70 indicates an overbought condition, which might signal a potential selling opportunity.',
        class: 'text-red-500',
        bgClass: 'bg-red-500/20'
      };
    } else if (rsi > 50) {
      return {
        status: 'Bullish',
        description: 'RSI between 50 and 70 indicates bullish momentum.',
        class: 'text-blue-500',
        bgClass: 'bg-blue-500/20'
      };
    } else {
      return {
        status: 'Bearish',
        description: 'RSI between 30 and 50 indicates bearish momentum.',
        class: 'text-amber-500',
        bgClass: 'bg-amber-500/20'
      };
    }
  };
  
  // MACD analysis
  const getMACDAnalysis = (macd) => {
    if (!macd) {
      return {
        status: 'Unknown',
        description: 'MACD data not available.',
        class: 'text-gray-400',
        bgClass: 'bg-gray-500/20'
      };
    }
    
    if (macd.MACD > macd.signal && macd.histogram > 0) {
      return {
        status: 'Bullish Crossover',
        description: 'MACD line is above the signal line with positive histogram, indicating a strong bullish signal.',
        class: 'text-green-500',
        bgClass: 'bg-green-500/20'
      };
    } else if (macd.MACD < macd.signal && macd.histogram < 0) {
      return {
        status: 'Bearish Crossover',
        description: 'MACD line is below the signal line with negative histogram, indicating a strong bearish signal.',
        class: 'text-red-500',
        bgClass: 'bg-red-500/20'
      };
    } else if (macd.MACD > macd.signal) {
      return {
        status: 'Bullish',
        description: 'MACD line is above the signal line, indicating a bullish signal.',
        class: 'text-blue-500',
        bgClass: 'bg-blue-500/20'
      };
    } else {
      return {
        status: 'Bearish',
        description: 'MACD line is below the signal line, indicating a bearish signal.',
        class: 'text-amber-500',
        bgClass: 'bg-amber-500/20'
      };
    }
  };
  
  // Get sentiment color
  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'text-green-500';
    if (sentiment === 'negative') return 'text-red-500';
    return 'text-amber-500';
  };
  
  const getSentimentBgColor = (sentiment) => {
    if (sentiment === 'positive') return 'bg-green-500/20';
    if (sentiment === 'negative') return 'bg-red-500/20';
    return 'bg-amber-500/20';
  };
  
  if (!analysis || !analysis.technicalIndicators) {
    return (
      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-white mb-4">Technical Indicators</h2>
        <div className="text-gray-400">No technical data available</div>
      </div>
    );
  }
  
  const { technicalIndicators, marketData } = analysis;
  const rsiAnalysis = getRSIAnalysis(technicalIndicators.rsi);
  const macdAnalysis = getMACDAnalysis(technicalIndicators.macd);
  
  return (
    <div className="dashboard-card">
      <h2 className="text-xl font-bold text-white mb-4">Technical Indicators</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Action */}
        <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-blue-500/40 transition-colors">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-medium text-white">Price Action</h3>
            <button 
              onClick={() => toggleDetails('price')}
              className="text-blue-500 text-sm hover:text-blue-400"
            >
              {showDetails.price ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Price</span>
              <span className="text-white">${marketData.price.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">24h Change</span>
              <span className={parseFloat(marketData.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}>
                {parseFloat(marketData.priceChangePercent) >= 0 ? '+' : ''}{marketData.priceChangePercent}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-white">${marketData.volume.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">24h High</span>
              <span className="text-green-500">${marketData.high.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">24h Low</span>
              <span className="text-red-500">${marketData.low.toFixed(2)}</span>
            </div>
          </div>
          
          {showDetails.price && (
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-gray-300 text-sm">
                The current price of {analysis.symbol.replace('USDT', '')} is ${marketData.price.toFixed(2)}. 
                Over the past 24 hours, it has experienced a 
                <span className={parseFloat(marketData.priceChangePercent) >= 0 ? ' text-green-500' : ' text-red-500'}>
                  {parseFloat(marketData.priceChangePercent) >= 0 ? ' positive' : ' negative'} change of {marketData.priceChangePercent}%
                </span>. 
                The trading volume during this period was ${marketData.volume.toLocaleString()}, with a high of ${marketData.high.toFixed(2)} and a low of ${marketData.low.toFixed(2)}.
              </p>
            </div>
          )}
        </div>
        
        {/* RSI Analysis */}
        <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-blue-500/40 transition-colors">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-medium text-white">RSI (14)</h3>
            <button 
              onClick={() => toggleDetails('rsi')}
              className="text-blue-500 text-sm hover:text-blue-400"
            >
              {showDetails.rsi ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="text-xl font-bold text-white mr-3">{technicalIndicators.rsi.toFixed(1)}</div>
            <div className={`px-2 py-1 rounded-full ${rsiAnalysis.bgClass} ${rsiAnalysis.class}`}>
              {rsiAnalysis.status}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  technicalIndicators.rsi < 30 ? 'bg-green-500' : 
                  technicalIndicators.rsi > 70 ? 'bg-red-500' : 
                  technicalIndicators.rsi > 50 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${technicalIndicators.rsi}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0</span>
              <span>30</span>
              <span>50</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>
          
          {showDetails.rsi && (
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-gray-300 text-sm">{rsiAnalysis.description}</p>
              <p className="text-gray-300 text-sm mt-2">
                RSI (Relative Strength Index) measures the magnitude of recent price changes to evaluate overbought or oversold conditions. Values below 30 generally indicate oversold conditions, while values above 70 suggest overbought conditions.
              </p>
            </div>
          )}
        </div>
        
        {/* MACD Analysis */}
        <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-blue-500/40 transition-colors">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-medium text-white">MACD</h3>
            <button 
              onClick={() => toggleDetails('macd')}
              className="text-blue-500 text-sm hover:text-blue-400"
            >
              {showDetails.macd ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="flex items-center mb-3">
            <div className={`px-2 py-1 rounded-full ${macdAnalysis.bgClass} ${macdAnalysis.class}`}>
              {macdAnalysis.status}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">MACD Line</span>
              <span className="text-white">{technicalIndicators.macd?.MACD?.toFixed(4) || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Signal Line</span>
              <span className="text-white">{technicalIndicators.macd?.signal?.toFixed(4) || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Histogram</span>
              <span className={
                technicalIndicators.macd?.histogram > 0 ? 'text-green-500' : 
                technicalIndicators.macd?.histogram < 0 ? 'text-red-500' : 'text-white'
              }>
                {technicalIndicators.macd?.histogram?.toFixed(4) || 'N/A'}
              </span>
            </div>
          </div>
          
          {showDetails.macd && (
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-gray-300 text-sm">{macdAnalysis.description}</p>
              <p className="text-gray-300 text-sm mt-2">
                MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price. A bullish signal occurs when the MACD line crosses above the signal line, and a bearish signal when it crosses below.
              </p>
            </div>
          )}
        </div>
        
        {/* Market Sentiment */}
        <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-blue-500/40 transition-colors">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-medium text-white">Market Sentiment</h3>
            <button 
              onClick={() => toggleDetails('sentiment')}
              className="text-blue-500 text-sm hover:text-blue-400"
            >
              {showDetails.sentiment ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="flex items-center mb-3">
            <div className={`px-2 py-1 rounded-full ${getSentimentBgColor(analysis.sentiment.sentiment)} ${getSentimentColor(analysis.sentiment.sentiment)}`}>
              {analysis.sentiment.sentiment.charAt(0).toUpperCase() + analysis.sentiment.sentiment.slice(1)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">News Analysis</span>
              <span className={getSentimentColor(analysis.sentiment.sentiment)}>
                {analysis.sentiment.articles.length} articles
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">AI Interpretation</span>
              <span className="text-white">{
                analysis.sentiment.sentiment === 'positive' ? 'Bullish' : 
                analysis.sentiment.sentiment === 'negative' ? 'Bearish' : 'Neutral'
              }</span>
            </div>
          </div>
          
          {showDetails.sentiment && (
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-gray-300 text-sm">
                The overall market sentiment for {analysis.symbol.replace('USDT', '')} based on news analysis is 
                <span className={getSentimentColor(analysis.sentiment.sentiment)}>
                  {' ' + analysis.sentiment.sentiment}
                </span>.
                This sentiment is derived from analyzing {analysis.sentiment.articles.length} recent news articles about this cryptocurrency.
              </p>
              {analysis.sentiment.articles.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 text-xs mb-1">Recent Headlines:</p>
                  <ul className="text-gray-300 text-sm list-disc list-inside">
                    {analysis.sentiment.articles.slice(0, 3).map((article, index) => (
                      <li key={index} className="truncate">
                        {article.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicators;