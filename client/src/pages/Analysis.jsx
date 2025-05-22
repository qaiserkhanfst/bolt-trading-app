import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BoltIcon, 
  ChartBarIcon, LightBulbIcon, NewspaperIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { analyzeCoin } from '../services/analysisService';
import { calculateTradeParameters } from '../services/tradeService';
import { useAuth } from '../contexts/AuthContext';
import CoinSelector from '../components/common/CoinSelector';
import PriceChart from '../components/analysis/PriceChart';
import TechnicalIndicators from '../components/analysis/TechnicalIndicators';
import AIRecommendation from '../components/analysis/AIRecommendation';
import NewsSentiment from '../components/analysis/NewsSentiment';
import RiskCalculator from '../components/analysis/RiskCalculator';

const Analysis = () => {
  const { currentUser } = useAuth();
  const { symbol: urlSymbol } = useParams();
  const navigate = useNavigate();
  
  const [selectedCoin, setSelectedCoin] = useState(urlSymbol || 'BTCUSDT');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [tradeParams, setTradeParams] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('technical');
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCoin) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load the analysis
        const analysisData = await analyzeCoin(selectedCoin);
        setAnalysis(analysisData);
        
        // Calculate trade parameters
        if (analysisData.analysis.recommendation === 'BUY') {
          const params = await calculateTradeParameters(selectedCoin, analysisData.analysis);
          setTradeParams(params);
        } else {
          setTradeParams(null);
        }
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [selectedCoin, currentUser.uid]);
  
  const handleCoinChange = (coin) => {
    setSelectedCoin(coin);
    navigate(`/analysis/${coin}`);
  };
  
  // Tabs content configuration
  const tabs = [
    { id: 'technical', label: 'Technical Analysis', icon: <ChartBarIcon className="h-5 w-5" /> },
    { id: 'news', label: 'News & Sentiment', icon: <NewspaperIcon className="h-5 w-5" /> },
    { id: 'risk', label: 'Risk Analysis', icon: <ScaleIcon className="h-5 w-5" /> }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container px-4 mx-auto py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <h3 className="text-red-500 mb-2 text-lg font-medium">Error</h3>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => setLoading(true)}
            className="mt-3 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Coin Analysis</h1>
          <p className="text-gray-400">Deep AI analysis of cryptocurrency market data</p>
        </div>
        
        <div className="mt-4 lg:mt-0">
          <CoinSelector
            value={selectedCoin}
            onChange={handleCoinChange}
          />
        </div>
      </div>
      
      {analysis && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="dashboard-card flex items-center">
              <div className="flex-shrink-0 p-3 rounded-full bg-blue-500/20 mr-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Price</p>
                <h3 className="text-xl font-bold text-white">${analysis.marketData.price.toFixed(2)}</h3>
                <div className="flex items-center mt-1">
                  {parseFloat(analysis.marketData.priceChangePercent) >= 0 ? (
                    <>
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 text-sm">+{analysis.marketData.priceChangePercent}% (24h)</span>
                    </>
                  ) : (
                    <>
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500 text-sm">{analysis.marketData.priceChangePercent}% (24h)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="dashboard-card flex items-center">
              <div className="flex-shrink-0 p-3 rounded-full bg-green-500/20 mr-4">
                <LightBulbIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">AI Recommendation</p>
                <h3 className="text-xl font-bold text-white">{analysis.analysis.recommendation}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-gray-400 text-sm">Risk Score: {analysis.analysis.riskScore}/10</span>
                </div>
              </div>
            </div>
            
            <div className="dashboard-card flex items-center">
              <div className="flex-shrink-0 p-3 rounded-full bg-purple-500/20 mr-4">
                <BoltIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Price Targets</p>
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 mr-2">${analysis.analysis.takeProfitPrice}</span>
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500">${analysis.analysis.stopLossPrice}</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-gray-400 text-sm">R/R Ratio: {(analysis.analysis.takeProfitPercent / analysis.analysis.stopLossPercent).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2">
              <div className="dashboard-card h-full">
                <h2 className="text-xl font-bold text-white mb-4">Price Chart</h2>
                <div className="h-80">
                  <PriceChart symbol={selectedCoin} />
                </div>
              </div>
            </div>
            
            <div>
              <AIRecommendation analysis={analysis} tradeParams={tradeParams} />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="border-b border-gray-700">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-4 px-1 flex items-center border-b-2 font-medium text-sm
                      ${activeTab === tab.id 
                        ? 'border-blue-500 text-blue-500'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
                    `}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'technical' && (
              <TechnicalIndicators analysis={analysis} />
            )}
            
            {activeTab === 'news' && (
              <NewsSentiment analysis={analysis} />
            )}
            
            {activeTab === 'risk' && (
              <RiskCalculator analysis={analysis} tradeParams={tradeParams} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;