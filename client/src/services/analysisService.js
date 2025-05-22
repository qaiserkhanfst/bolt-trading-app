import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Analyze a coin
export const analyzeCoin = async (symbol) => {
  try {
    const response = await axios.get(`${API_URL}/analysis/coin/${symbol}`);
    return response.data.data;
  } catch (error) {
    console.error('Error analyzing coin:', error);
    throw error;
  }
};

// Get trade parameters based on analysis
export const getTradeParameters = async (symbol) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${API_URL}/analysis/trade-parameters/${symbol}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error getting trade parameters:', error);
    throw error;
  }
};