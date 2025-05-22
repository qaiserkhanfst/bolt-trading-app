import { useState, useEffect } from 'react';
import { getSymbols } from '../../services/marketService';

const CoinSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableCoins, setAvailableCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const coins = await getSymbols();
        setAvailableCoins(coins);
      } catch (error) {
        console.error('Error fetching coins:', error);
        // Fallback to common coins if API fails
        setAvailableCoins([
          { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
          { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
          { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT' },
          { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
          { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoins();
  }, []);
  
  const handleSelect = (coin) => {
    onChange(coin);
    setIsOpen(false);
  };
  
  const filteredCoins = availableCoins.filter(coin => 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleClickOutside = (e) => {
    if (isOpen && !e.target.closest('.coin-selector')) {
      setIsOpen(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Get the current coin name for display
  const displayCoin = value?.replace('USDT', '');
  
  return (
    <div className="coin-selector relative">
      <button
        type="button"
        className="flex items-center bg-gray-800 p-2 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {!loading && (
          <img 
            src={`https://cryptoicons.org/api/icon/${displayCoin.toLowerCase()}/25`} 
            alt={displayCoin} 
            className="w-6 h-6 mr-2"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/25?text=' + displayCoin }}
          />
        )}
        <span className="text-white">{displayCoin || 'Select Coin'}</span>
        <svg className="ml-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search coins..."
              className="form-input w-full py-1 px-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="py-4 text-center">
                <div className="loading-spinner mb-2 mx-auto"></div>
                <p className="text-gray-400 text-sm">Loading coins...</p>
              </div>
            ) : filteredCoins.length > 0 ? (
              filteredCoins.map((coin) => (
                <button
                  key={coin.symbol}
                  type="button"
                  className={`flex items-center w-full px-3 py-2 text-left hover:bg-gray-700 ${
                    coin.symbol === value ? 'bg-blue-500/20 text-blue-400' : 'text-white'
                  }`}
                  onClick={() => handleSelect(coin.symbol)}
                >
                  <img 
                    src={`https://cryptoicons.org/api/icon/${coin.baseAsset.toLowerCase()}/25`} 
                    alt={coin.baseAsset} 
                    className="w-5 h-5 mr-2"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/25?text=' + coin.baseAsset }}
                  />
                  <span>{coin.baseAsset}</span>
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-gray-400">
                No coins found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinSelector;