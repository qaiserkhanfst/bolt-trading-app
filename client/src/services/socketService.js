import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Enhanced reconnection parameters
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 60000; // 1 minute
const MAX_RETRIES = 15;
const CONNECTION_TIMEOUT = 30000; // 30 seconds

let retryCount = 0;
let retryDelay = INITIAL_RETRY_DELAY;
let reconnectTimeout;
let connectionTimeout;
let isConnecting = false;

// Create socket connection with enhanced configuration
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: MAX_RETRIES,
  reconnectionDelay: retryDelay,
  reconnectionDelayMax: MAX_RETRY_DELAY,
  timeout: CONNECTION_TIMEOUT,
  transports: ['websocket', 'polling'],
  withCredentials: true,
  extraHeaders: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// Enhanced connection event handlers
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  
  // Reset connection parameters
  retryCount = 0;
  retryDelay = INITIAL_RETRY_DELAY;
  isConnecting = false;
  
  // Clear timeouts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  isConnecting = false;
  
  // Clear timeouts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }
  
  // Handle specific disconnect reasons
  if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
    handleReconnection();
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  isConnecting = false;
  
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }
  
  handleReconnection();
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
  isConnecting = false;
  
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }
  
  handleReconnection();
});

// Enhanced reconnection handler
const handleReconnection = () => {
  if (isConnecting) {
    console.log('Connection attempt already in progress, skipping reconnection');
    return;
  }
  
  // Clear existing timeouts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }
  
  if (retryCount >= MAX_RETRIES) {
    console.error('Max reconnection attempts reached');
    return;
  }
  
  retryCount++;
  retryDelay = Math.min(retryDelay * 1.5, MAX_RETRY_DELAY);
  
  console.log(`Attempting reconnection ${retryCount}/${MAX_RETRIES} in ${retryDelay}ms`);
  
  reconnectTimeout = setTimeout(() => {
    try {
      isConnecting = true;
      
      // Set connection timeout
      connectionTimeout = setTimeout(() => {
        console.warn('Connection attempt timed out');
        isConnecting = false;
        handleReconnection();
      }, CONNECTION_TIMEOUT);
      
      socket.connect();
    } catch (err) {
      console.error('Error during reconnection attempt:', err);
      isConnecting = false;
      handleReconnection();
    }
  }, retryDelay);
};

// Enhanced cleanup function
const cleanup = () => {
  isConnecting = false;
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }
  if (socket.connected) {
    socket.disconnect();
  }
};

// Add cleanup to window unload event
window.addEventListener('beforeunload', cleanup);

export default socket;