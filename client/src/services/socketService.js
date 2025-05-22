import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Configure reconnection parameters
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const MAX_RETRIES = 10;

let retryCount = 0;
let retryDelay = INITIAL_RETRY_DELAY;
let reconnectTimeout;

// Create socket connection with enhanced configuration
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: MAX_RETRIES,
  reconnectionDelay: retryDelay,
  reconnectionDelayMax: MAX_RETRY_DELAY,
  timeout: 20000, // Increase connection timeout
  transports: ['websocket', 'polling'],
  withCredentials: true
});

// Connection event handlers with exponential backoff
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  // Reset retry parameters on successful connection
  retryCount = 0;
  retryDelay = INITIAL_RETRY_DELAY;
  
  // Clear any existing reconnection timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  
  // Clear any existing reconnection timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  // Implement custom reconnection logic for certain disconnect reasons
  if (reason === 'io server disconnect' || reason === 'transport close') {
    handleReconnection();
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  handleReconnection();
});

// Add error handler
socket.on('error', (error) => {
  console.error('Socket error:', error);
  handleReconnection();
});

// Enhanced reconnection handler with exponential backoff
const handleReconnection = () => {
  // Clear any existing reconnection timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
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
      socket.connect();
    } catch (err) {
      console.error('Error during reconnection attempt:', err);
      handleReconnection();
    }
  }, retryDelay);
};

// Cleanup function for component unmounting
const cleanup = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (socket.connected) {
    socket.disconnect();
  }
};

// Add cleanup to window unload event
window.addEventListener('beforeunload', cleanup);

export default socket;