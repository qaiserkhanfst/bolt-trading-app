import { useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const RecentTrades = ({ trades = [] }) => {
  const [displayCount, setDisplayCount] = useState(5);
  
  // If no trades are passed, use mock data
  const tradesData = trades.length > 0 ? trades : [
    { 
      id: '1', 
      symbol: 'BTCUSDT', 
      type: 'BUY', 
      amount: 0.05, 
      entryPrice: 35000, 
      status: 'OPEN',
      createdAt: '2023-11-23T10:30:00Z',
      targetPrice: 38000,
      stopLossPrice: 34000,
      aiAnalysis: {
        recommendationType: 'BUY',
        riskScore: 4
      }
    },
    { 
      id: '2', 
      symbol: 'ETHUSDT', 
      type: 'BUY', 
      amount: 0.5, 
      entryPrice: 2200, 
      status: 'OPEN',
      createdAt: '2023-11-22T14:45:00Z',
      targetPrice: 2400,
      stopLossPrice: 2100,
      aiAnalysis: {
        recommendationType: 'BUY',
        riskScore: 5
      }
    },
    { 
      id: '3', 
      symbol: 'SOLUSDT', 
      type: 'SELL', 
      amount: 10, 
      entryPrice: 58, 
      status: 'CLOSED',
      createdAt: '2023-11-20T09:15:00Z',
      closedAt: '2023-11-21T11:30:00Z',
      closedPrice: 63,
      profit: 50,
      profitPercent: 8.62,
      aiAnalysis: {
        recommendationType: 'SELL',
        riskScore: 7
      }
    },
    { 
      id: '4', 
      symbol: 'BNBUSDT', 
      type: 'BUY', 
      amount: 1, 
      entryPrice: 245, 
      status: 'CLOSED',
      createdAt: '2023-11-18T16:20:00Z',
      closedAt: '2023-11-19T19:45:00Z',
      closedPrice: 230,
      profit: -15,
      profitPercent: -6.12,
      aiAnalysis: {
        recommendationType: 'BUY',
        riskScore: 6
      }
    },
    { 
      id: '5', 
      symbol: 'ADAUSDT', 
      type: 'BUY', 
      amount: 500, 
      entryPrice: 0.41, 
      status: 'OPEN',
      createdAt: '2023-11-17T08:10:00Z',
      targetPrice: 0.45,
      stopLossPrice: 0.38,
      aiAnalysis: {
        recommendationType: 'BUY',
        riskScore: 3
      }
    },
    { 
      id: '6', 
      symbol: 'DOTUSDT', 
      type: 'BUY', 
      amount: 20, 
      entryPrice: 6.2, 
      status: 'CLOSED',
      createdAt: '2023-11-15T11:00:00Z',
      closedAt: '2023-11-17T13:20:00Z',
      closedPrice: 6.8,
      profit: 12,
      profitPercent: 9.68,
      aiAnalysis: {
        recommendationType: 'BUY',
        riskScore: 4
      }
    }
  ];
  
  const formatDate = (dateString) => {
    return dayjs(dateString).fromNow();
  };
  
  const formatProfit = (profit, profitPercent) => {
    const sign = profit >= 0 ? '+' : '';
    return `${sign}$${profit.toFixed(2)} (${sign}${profitPercent.toFixed(2)}%)`;
  };
  
  const showMore = () => {
    setDisplayCount(tradesData.length);
  };
  
  const showLess = () => {
    setDisplayCount(5);
  };
  
  return (
    <div className="dashboard-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Trades</h2>
        <Link to="/portfolio" className="text-blue-500 hover:text-blue-400 text-sm">
          View all trades
        </Link>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Entry Price</th>
              <th>Status</th>
              <th>Date</th>
              <th>P/L</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {tradesData.slice(0, displayCount).map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-700 transition-colors duration-150">
                <td>
                  <div className="flex items-center">
                    <img 
                      src={`https://cryptoicons.org/api/icon/${trade.symbol.replace('USDT', '').toLowerCase()}/25`} 
                      alt={trade.symbol} 
                      className="w-5 h-5 mr-2"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/25?text=' + trade.symbol.replace('USDT', '') }}
                    />
                    <span>{trade.symbol.replace('USDT', '')}</span>
                  </div>
                </td>
                <td className={trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                  {trade.type}
                </td>
                <td>{trade.amount}</td>
                <td>${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    trade.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-gray-600/40 text-gray-300'
                  }`}>
                    {trade.status}
                  </span>
                </td>
                <td className="text-gray-400 text-sm">
                  {formatDate(trade.createdAt)}
                </td>
                <td className={
                  trade.status === 'OPEN' ? 'text-gray-400' : 
                  trade.profit >= 0 ? 'text-green-500' : 'text-red-500'
                }>
                  {trade.status === 'OPEN' ? '-' : formatProfit(trade.profit, trade.profitPercent)}
                </td>
                <td>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    trade.aiAnalysis.recommendationType === 'BUY' ? 'bg-green-500/20 text-green-500' :
                    trade.aiAnalysis.recommendationType === 'SELL' ? 'bg-red-500/20 text-red-500' :
                    'bg-amber-500/20 text-amber-500'
                  }`}>
                    {trade.aiAnalysis.recommendationType}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tradesData.length > 5 && (
        <div className="mt-4 text-center">
          {displayCount === 5 ? (
            <button 
              onClick={showMore}
              className="text-blue-500 hover:text-blue-400 text-sm"
            >
              Show more trades
            </button>
          ) : (
            <button 
              onClick={showLess}
              className="text-blue-500 hover:text-blue-400 text-sm"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentTrades;