import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioSummary = () => {
  const [loading, setLoading] = useState(true);
  
  // Mock data - in a real app this would come from an API
  const portfolioData = {
    total: 12345.67,
    change: 3.2,
    allocation: [
      { symbol: 'BTC', value: 5678.90, color: '#F7931A', percent: 46 },
      { symbol: 'ETH', value: 2345.67, color: '#627EEA', percent: 19 },
      { symbol: 'BNB', value: 1234.56, color: '#F3BA2F', percent: 10 },
      { symbol: 'SOL', value: 987.65, color: '#00FFA3', percent: 8 },
      { symbol: 'ADA', value: 765.43, color: '#0033AD', percent: 6 },
      { symbol: 'Other', value: 1333.46, color: '#A1A1AA', percent: 11 }
    ]
  };
  
  const chartData = {
    labels: portfolioData.allocation.map(item => item.symbol),
    datasets: [
      {
        data: portfolioData.allocation.map(item => item.percent),
        backgroundColor: portfolioData.allocation.map(item => item.color),
        borderColor: 'rgba(24, 24, 27, 0.8)',
        borderWidth: 1,
        hoverOffset: 5
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        },
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        boxPadding: 4
      }
    },
    cutout: '75%'
  };
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="dashboard-card h-full">
        <h2 className="text-xl font-bold text-white mb-4">Portfolio</h2>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="loading-spinner mb-3"></div>
          <p className="text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Portfolio</h2>
        <Link to="/portfolio" className="text-blue-500 hover:text-blue-400 text-sm">
          View details
        </Link>
      </div>
      
      <div className="flex items-center justify-center mb-2">
        <div className="text-center">
          <div className="text-gray-400 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">${portfolioData.total.toLocaleString()}</div>
          <div className="flex items-center justify-center mt-1">
            {portfolioData.change >= 0 ? (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{portfolioData.change}% today</span>
              </>
            ) : (
              <>
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500 text-sm">{portfolioData.change}% today</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center my-4">
        <div className="h-48 w-48 relative">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="text-gray-400 text-sm">Allocation</div>
            <div className="text-white font-medium">{portfolioData.allocation.length} assets</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-gray-400 mb-2 text-sm">Asset Allocation</h3>
        <div className="space-y-2">
          {portfolioData.allocation.map((asset, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
                <span className="text-white">{asset.symbol}</span>
              </div>
              <div className="text-gray-300">{asset.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;