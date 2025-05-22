import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${API_URL}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.put(
      `${API_URL}/auth/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user settings
export const getUserSettings = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${API_URL}/user/settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    // Return default settings if API call fails
    return {
      tradingMode: 'MANUAL',
      defaultRiskPercent: 2,
      notificationsEnabled: true,
      emailNotifications: false,
      theme: 'dark',
      defaultSymbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
    };
  }
};

// Update user settings
export const updateUserSettings = async (settings) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.put(
      `${API_URL}/user/settings`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${API_URL}/user/statistics`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

// Connect Binance API keys
export const connectBinanceAPI = async (apiKey, apiSecret) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(
      `${API_URL}/auth/connect-binance`,
      { apiKey, apiSecret },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error connecting Binance API:', error);
    throw error;
  }
};