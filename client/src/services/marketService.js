import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all available symbols
export const getSymbols = async () => {
  try {
    const response = await axios.get(`${API_URL}/market/symbols`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching symbols:', error);
    throw error;
  }
};

// Get candlestick data for a symbol
export const getKlines = async (symbol, interval = '1h', limit = 100) => {
  try {
    const response = await axios.get(`${API_URL}/market/klines/${symbol}?interval=${interval}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching klines:', error);
    throw error;
  }
};

// Get current price for a symbol
export const getCurrentPrice = async (symbol) => {
  try {
    const response = await axios.get(`${API_URL}/market/price/${symbol}`);
    return response.data.data.price;
  } catch (error) {
    console.error('Error fetching price:', error);
    throw error;
  }
};

// Get prices for multiple symbols
export const getMultiplePrices = async (symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']) => {
  try {
    const response = await axios.get(`${API_URL}/market/prices?symbols=${symbols.join(',')}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching multiple prices:', error);
    throw error;
  }
};

// Get top coins by market cap
export const getTopCoins = async (limit = 10) => {
  // In a real app, this would use a specific endpoint
  // Here we're just returning a static list of popular coins
  return [
    { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
    { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
    { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT' },
    { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT' },
    { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
    { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT' },
    { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT' },
    { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT' },
    { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT' },
    { symbol: 'LTCUSDT', baseAsset: 'LTC', quoteAsset: 'USDT' }
  ];
};