import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Execute a trade
export const executeTrade = async (tradeParams) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/trade/execute`,
      tradeParams,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
};

// Calculate trade parameters
export const calculateTradeParameters = async (symbol, analysis) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/trade/calculate-parameters`,
      {
        symbol,
        analysis
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error calculating trade parameters:', error);
    throw error;
  }
};

// Get user's trades
export const getUserTrades = async (status = null, limit = 20) => {
  try {
    const token = localStorage.getItem('authToken');
    
    let url = `${API_URL}/trade/user-trades?limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user trades:', error);
    throw error;
  }
};

// Close a trade
export const closeTrade = async (tradeId, closedPrice = null) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/trade/close/${tradeId}`,
      { closedPrice },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error closing trade:', error);
    throw error;
  }
};