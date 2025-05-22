import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const MarketOverview = ({ marketData }) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'volume',
    direction: 'desc'
  });
  
  useEffect(() => {
    if (marketData && marketData.length > 0) {
      const data = [...marketData];
      
      data.sort((a, b) => {
        if (sortConfig.key === 'symbol') {
          return sortConfig.direction === 'asc' 
            ? a.symbol.localeCompare(b.symbol)
            : b.symbol.localeCompare(a.symbol);
        }
        
        if (sortConfig.direction === 'asc') {
          return a[sortConfig.key] - b[sortConfig.key];
        }
        return b[sortConfig.key] - a[sortConfig.key];
      });
      
      setSortedData(data);
    }
  }, [marketData, sortConfig]);
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key 
        ? prevConfig.direction === 'asc' ? 'desc' : 'asc'
        : 'desc'
    }));
  };
  
  const formatPrice = (price) => {
    if (price < 0.1) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else if (price < 1000) {
      return price.toFixed(2);
    } else {
      return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
  };
  
  const formatPercentage = (percent) => {
    const value = parseFloat(percent);
    return value.toFixed(2) + '%';
  };
  
  const formatVolume = (volume) => {
    if (volume >= 1e9) {
      return (volume / 1e9).toFixed(2) + 'B';
    } else if (volume >= 1e6) {
      return (volume / 1e6).toFixed(2) + 'M';
    } else if (volume >= 1e3) {
      return (volume / 1e3).toFixed(2) + 'K';
    }
    return volume.toFixed(2);
  };
  
  return (
    <div className="dashboard-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Market Overview</h2>
        <Link to="/trading" className="text-blue-500 hover:text-blue-400 text-sm">
          View all markets
        </Link>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('symbol')} className="cursor-pointer">
                Coin
                {sortConfig.key === 'symbol' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                )}
              </th>
              <th onClick={() => handleSort('price')} className="cursor-pointer">
                Price
                {sortConfig.key === 'price' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                )}
              </th>
              <th onClick={() => handleSort('priceChangePercent')} className="cursor-pointer">
                24h Change
                {sortConfig.key === 'priceChangePercent' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                )}
              </th>
              <th onClick={() => handleSort('volume')} className="cursor-pointer">
                Volume
                {sortConfig.key === 'volume' && (
                  sortConfig.direction === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                )}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((coin) => (
                <tr key={coin.symbol} className="hover:bg-gray-700 transition-colors duration-150">
                  <td>
                    <div className="flex items-center">
                      <img 
                        src={`https://cryptoicons.org/api/icon/${coin.symbol.replace('USDT', '').toLowerCase()}/25`} 
                        alt={coin.symbol} 
                        className="w-6 h-6 mr-2"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/25?text=' + coin.symbol.replace('USDT', '') }}
                      />
                      <span>{coin.symbol.replace('USDT', '')}</span>
                    </div>
                  </td>
                  <td>${formatPrice(coin.price)}</td>
                  <td className={parseFloat(coin.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{formatPercentage(coin.priceChangePercent)}
                  </td>
                  <td>${formatVolume(coin.volume)}</td>
                  <td>
                    <Link 
                      to={`/analysis/${coin.symbol}`}
                      className="text-xs bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 px-2 py-1 rounded transition-colors duration-150"
                    >
                      Analyze
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="loading-spinner mb-2"></div>
                    <p className="text-gray-400">Loading market data...</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketOverview;