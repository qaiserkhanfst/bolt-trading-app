import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BoltIcon, 
  CurrencyDollarIcon, ExclamationCircleIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import MarketOverview from '../components/dashboard/MarketOverview';
import TradingSignals from '../components/dashboard/TradingSignals';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import RecentTrades from '../components/dashboard/RecentTrades';
import TradingModeToggle from '../components/dashboard/TradingModeToggle';
import CoinSelector from '../components/common/CoinSelector';
import { getMultiplePrices, getTopCoins } from '../services/marketService';
import { getUserSettings } from '../services/userService';
import { getUserTrades } from '../services/tradeService';
import socket from '../services/socketService';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [recentTrades, setRecentTrades] = useState([]);
  const [tradingMode, setTradingMode] = useState('MANUAL');
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Get user settings
        const settings = await getUserSettings();
        setUserSettings(settings);
        setTradingMode(settings.tradingMode || 'MANUAL');
        
        // Get top coins by market cap
        const coins = await getTopCoins();
        
        // Get market data for those coins
        const data = await getMultiplePrices(coins.map(c => c.symbol));
        setMarketData(data);
        
        // Get recent trades
        const trades = await getUserTrades();
        setRecentTrades(trades);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Socket connection for real-time updates
    const defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
    
    defaultSymbols.forEach(symbol => {
      socket.emit('subscribe', symbol);
    });
    
    socket.on('ticker', (tickerData) => {
      setMarketData(prev => {
        const index = prev.findIndex(item => item.symbol === tickerData.symbol);
        if (index === -1) return [...prev, tickerData];
        
        const updated = [...prev];
        updated[index] = tickerData;
        return updated;
      });
    });
    
    return () => {
      defaultSymbols.forEach(symbol => {
        socket.emit('unsubscribe', symbol);
      });
      socket.off('ticker');
    };
  }, [currentUser.uid]);
  
  const handleCoinChange = (coin) => {
    setSelectedCoin(coin);
  };
  
  const handleTradingModeChange = (mode) => {
    setTradingMode(mode);
    // Save to backend would happen here
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }
  
  return (
    <div className="container px-4 mx-auto py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {currentUser.displayName || 'Trader'}</h1>
          <p className="text-gray-400">Here's what's happening with your portfolio today</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
          <CoinSelector
            value={selectedCoin}
            onChange={handleCoinChange}
          />
          
          <TradingModeToggle
            value={tradingMode}
            onChange={handleTradingModeChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card flex items-center">
          <div className="p-3 rounded-full bg-blue-500/20 mr-4">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Portfolio Value</p>
            <h3 className="text-xl font-bold text-white">$12,345.67</h3>
            <div className="flex items-center mt-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm">+3.2% today</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card flex items-center">
          <div className="p-3 rounded-full bg-green-500/20 mr-4">
            <BoltIcon className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Active Trades</p>
            <h3 className="text-xl font-bold text-white">5</h3>
            <div className="flex items-center mt-1">
              <span className="text-gray-400 text-sm">2 profitable, 3 pending</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card flex items-center">
          <div className="p-3 rounded-full bg-purple-500/20 mr-4">
            <ArrowsPointingOutIcon className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Performance</p>
            <h3 className="text-xl font-bold text-white">68% Win Rate</h3>
            <div className="flex items-center mt-1">
              <span className="text-gray-400 text-sm">Last 30 days</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <MarketOverview marketData={marketData} />
        </div>
        
        <div>
          <TradingSignals selectedCoin={selectedCoin} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentTrades trades={recentTrades} />
        </div>
        
        <div>
          <PortfolioSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;