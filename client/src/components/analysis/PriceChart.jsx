import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { getKlines } from '../../services/marketService';
import socket from '../../services/socketService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const PriceChart = ({ symbol }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        const klines = await getKlines(symbol, timeframe);
        
        const labels = klines.map(k => {
          const date = new Date(k.time);
          if (timeframe === '1d' || timeframe === '1w') {
            return date.toLocaleDateString();
          }
          return date.toLocaleTimeString();
        });
        
        const prices = klines.map(k => k.close);
        
        // Calculate simple moving averages
        const sma20 = calculateSMA(prices, 20);
        const sma50 = calculateSMA(prices, 50);
        
        setChartData({
          labels,
          datasets: [
            {
              label: `${symbol} Price`,
              data: prices,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.1,
              fill: true
            },
            {
              label: 'SMA 20',
              data: sma20,
              borderColor: '#22c55e',
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.1,
              fill: false
            },
            {
              label: 'SMA 50',
              data: sma50,
              borderColor: '#f59e0b',
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.1,
              fill: false
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
    
    // Subscribe to real-time updates
    socket.emit('subscribe', symbol);
    
    socket.on('ticker', (tickerData) => {
      if (tickerData.symbol === symbol) {
        setChartData(prevData => {
          if (!prevData.labels || !prevData.datasets || prevData.datasets.length === 0) {
            return prevData;
          }
          
          // Only update in real-time for short timeframes
          if (timeframe === '1m' || timeframe === '5m' || timeframe === '15m') {
            const newLabels = [...prevData.labels];
            const newPrices = [...prevData.datasets[0].data];
            
            // Update the last price
            newPrices[newPrices.length - 1] = tickerData.price;
            
            // Update the SMAs (simplified approach)
            const newDatasets = [...prevData.datasets];
            if (newDatasets.length > 1) {
              newDatasets[1].data = calculateSMA(newPrices, 20);
              newDatasets[2].data = calculateSMA(newPrices, 50);
            }
            
            return {
              labels: newLabels,
              datasets: newDatasets
            };
          }
          
          return prevData;
        });
      }
    });
    
    return () => {
      socket.emit('unsubscribe', symbol);
      socket.off('ticker');
    };
  }, [symbol, timeframe]);
  
  // Calculate Simple Moving Average
  const calculateSMA = (data, period) => {
    const result = [];
    
    // Add null values for the initial period where SMA can't be calculated
    for (let i = 0; i < period - 1; i++) {
      result.push(null);
    }
    
    // Calculate SMA for the rest of the data
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    
    return result;
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.1
      }
    }
  };
  
  const timeframeOptions = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
  ];
  
  return (
    <div className="h-full">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeframe(option.value)}
              className={`
                px-3 py-1 text-sm font-medium
                ${timeframe === option.value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                ${option.value === '1m' ? 'rounded-l-md' : ''}
                ${option.value === '1w' ? 'rounded-r-md' : ''}
                border-r border-gray-600 last:border-r-0
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100%-40px)]">
          <div className="loading-spinner" />
        </div>
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
};

export default PriceChart;