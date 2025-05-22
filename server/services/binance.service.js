const Binance = require('binance-api-node').default;
const NodeCache = require('node-cache');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

// Initialize cache with 5 minute standard TTL
const marketDataCache = new NodeCache({ stdTTL: 300 });

// Initialize Binance client with increased timeout settings
const binanceClient = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  getTime: () => Date.now(),
  timeout: 120000, // Increased timeout to 120 seconds
  wsOptions: {
    timeout: 120000, // Increased to 120 seconds
    handshakeTimeout: 120000, // Increased to 120 seconds
    clientConfig: {
      maxReceivedFrameSize: 100 * 1024 * 1024, // 100MB
      maxReceivedMessageSize: 100 * 1024 * 1024, // 100MB
      keepalive: true,
      keepaliveInterval: 30000 // 30 seconds
    }
  }
});

// Initialize websocket connections for price updates
const initBinanceWebsockets = (io) => {
  try {
    // Store active websocket connections
    const activeConnections = {};
    
    // Enhanced reconnection configuration
    const INITIAL_RETRY_DELAY = 5000; // Increased initial delay to 5 seconds
    const MAX_RETRY_DELAY = 300000; // Increased max delay to 5 minutes
    const MAX_RETRIES = 20; // Increased max retries
    const CONNECTION_TIMEOUT = 60000; // 60 second connection timeout
    
    // Function to create a ticker websocket with enhanced reconnection logic
    const createTickerSocket = (symbol) => {
      if (activeConnections[symbol]) {
        return activeConnections[symbol];
      }
      
      logger.info(`Starting Binance websocket for ${symbol}`);
      
      let retryCount = 0;
      let retryDelay = INITIAL_RETRY_DELAY;
      let reconnectTimeout;
      let isConnecting = false;
      let connectionTimeout;
      
      const connectWebSocket = () => {
        if (isConnecting) {
          logger.warn(`Connection attempt already in progress for ${symbol}`);
          return null;
        }

        try {
          isConnecting = true;
          
          // Clear any existing timeouts
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
          }
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
          }
          
          // Close existing connection if any
          if (activeConnections[symbol]) {
            try {
              activeConnections[symbol]();
              delete activeConnections[symbol];
            } catch (err) {
              logger.warn(`Error closing existing connection for ${symbol}: ${err.message}`);
            }
          }

          // Set connection timeout
          connectionTimeout = setTimeout(() => {
            logger.warn(`Connection timeout for ${symbol}`);
            isConnecting = false;
            if (activeConnections[symbol]) {
              try {
                activeConnections[symbol]();
                delete activeConnections[symbol];
              } catch (err) {
                logger.warn(`Error closing timed out connection for ${symbol}: ${err.message}`);
              }
            }
            handleReconnection(symbol);
          }, CONNECTION_TIMEOUT);
          
          const clean = binanceClient.ws.ticker(symbol, ticker => {
            // Clear connection timeout on successful data
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            isConnecting = false;
            
            // Reset retry parameters on successful data
            retryCount = 0;
            retryDelay = INITIAL_RETRY_DELAY;
            
            io.to(symbol).emit('ticker', {
              symbol: ticker.symbol,
              price: ticker.curDayClose,
              priceChange: ticker.priceChange,
              priceChangePercent: ticker.priceChangePercent,
              volume: ticker.volume,
              high: ticker.high,
              low: ticker.low,
              timestamp: Date.now()
            });
          });
          
          // Enhanced error handling with specific error types
          if (clean && clean.on) {
            clean.on('error', (err) => {
              if (connectionTimeout) {
                clearTimeout(connectionTimeout);
                connectionTimeout = null;
              }
              isConnecting = false;
              logger.error(`WebSocket error for ${symbol}: ${err.message}`);
              
              // Handle specific error types
              if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                logger.warn(`Connection failed for ${symbol}, attempting reconnect...`);
                handleReconnection(symbol);
              } else {
                // For other errors, attempt immediate reconnection
                setTimeout(() => handleReconnection(symbol), 1000);
              }
            });
            
            clean.on('close', () => {
              if (connectionTimeout) {
                clearTimeout(connectionTimeout);
                connectionTimeout = null;
              }
              isConnecting = false;
              logger.warn(`WebSocket closed for ${symbol}`);
              handleReconnection(symbol);
            });
          }
          
          activeConnections[symbol] = clean;
          return clean;
        } catch (err) {
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          isConnecting = false;
          logger.error(`WebSocket connection error for ${symbol}: ${err.message}`);
          handleReconnection(symbol);
          return null;
        }
      };
      
      const handleReconnection = (symbol) => {
        if (retryCount >= MAX_RETRIES) {
          logger.error(`Max reconnection attempts reached for ${symbol}`);
          return;
        }
        
        retryCount++;
        retryDelay = Math.min(retryDelay * 1.5, MAX_RETRY_DELAY);
        
        logger.info(`Attempting reconnection ${retryCount}/${MAX_RETRIES} for ${symbol} in ${retryDelay}ms`);
        
        // Clear any existing timeout
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        
        reconnectTimeout = setTimeout(() => {
          if (!isConnecting) {
            connectWebSocket();
          }
        }, retryDelay);
      };
      
      return connectWebSocket();
    };
    
    // Create default connections for popular coins
    const defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
    defaultSymbols.forEach(createTickerSocket);
    
    // Handle socket.io connections
    io.on('connection', (socket) => {
      socket.on('subscribe', (symbol) => {
        createTickerSocket(symbol);
        socket.join(symbol);
      });
      
      socket.on('unsubscribe', (symbol) => {
        socket.leave(symbol);
      });
      
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
    
    // Enhanced cleanup function for graceful shutdown
    const cleanup = () => {
      Object.entries(activeConnections).forEach(([symbol, connection]) => {
        try {
          if (connection) {
            connection();
            logger.info(`Closed connection for ${symbol}`);
          }
        } catch (err) {
          logger.error(`Error closing connection for ${symbol}: ${err.message}`);
        }
      });
    };
    
    // Handle process termination
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    
    return activeConnections;
  } catch (error) {
    logger.error(`Binance websocket initialization error: ${error.message}`);
    throw error;
  }
};

// Get current price for a symbol
const getCurrentPrice = async (symbol) => {
  try {
    // Check cache first
    const cacheKey = `price_${symbol}`;
    const cachedPrice = marketDataCache.get(cacheKey);
    
    if (cachedPrice) {
      return cachedPrice;
    }
    
    // If not in cache, fetch from API
    const ticker = await binanceClient.prices({ symbol });
    marketDataCache.set(cacheKey, parseFloat(ticker[symbol]), 60); // Cache for 1 minute
    
    return parseFloat(ticker[symbol]);
  } catch (error) {
    logger.error(`Error fetching price for ${symbol}: ${error.message}`);
    throw error;
  }
};

// Get klines (candlestick data)
const getKlines = async (symbol, interval, limit = 100) => {
  try {
    // Check cache first
    const cacheKey = `klines_${symbol}_${interval}_${limit}`;
    const cachedData = marketDataCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // If not in cache, fetch from API
    const klines = await binanceClient.candles({
      symbol,
      interval,
      limit
    });
    
    // Process data into a more usable format
    const processedData = klines.map(candle => ({
      time: candle.openTime,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume)
    }));
    
    // Cache the processed data (TTL depends on interval)
    const ttl = interval.includes('m') ? 60 : 300; // 1 minute for minute candles, 5 minutes for others
    marketDataCache.set(cacheKey, processedData, ttl);
    
    return processedData;
  } catch (error) {
    logger.error(`Error fetching klines for ${symbol}: ${error.message}`);
    throw error;
  }
};

// Get all available symbols
const getSymbols = async () => {
  try {
    // Check cache first
    const cacheKey = 'all_symbols';
    const cachedSymbols = marketDataCache.get(cacheKey);
    
    if (cachedSymbols) {
      return cachedSymbols;
    }
    
    // If not in cache, fetch from API
    const exchangeInfo = await binanceClient.exchangeInfo();
    const symbols = exchangeInfo.symbols
      .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
      .map(s => ({
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        quoteAsset: s.quoteAsset
      }));
    
    // Cache for 1 hour (symbols don't change often)
    marketDataCache.set(cacheKey, symbols, 3600);
    
    return symbols;
  } catch (error) {
    logger.error(`Error fetching symbols: ${error.message}`);
    throw error;
  }
};

// Execute a market buy order
const executeBuyOrder = async (symbol, quoteAmount) => {
  try {
    logger.info(`Executing buy order for ${symbol}, amount: ${quoteAmount} USDT`);
    
    // For market orders, we need to calculate the quantity based on current price
    const currentPrice = await getCurrentPrice(symbol);
    const quantity = quoteAmount / currentPrice;
    
    // Execute the order
    const order = await binanceClient.order({
      symbol: symbol,
      side: 'BUY',
      type: 'MARKET',
      quoteOrderQty: quoteAmount.toFixed(2) // USDT amount to spend
    });
    
    logger.info(`Buy order executed: ${JSON.stringify(order)}`);
    return order;
  } catch (error) {
    logger.error(`Error executing buy order for ${symbol}: ${error.message}`);
    throw error;
  }
};

// Execute a market sell order
const executeSellOrder = async (symbol, quantity) => {
  try {
    logger.info(`Executing sell order for ${symbol}, quantity: ${quantity}`);
    
    // Execute the order
    const order = await binanceClient.order({
      symbol: symbol,
      side: 'SELL',
      type: 'MARKET',
      quantity: quantity.toFixed(6) // Asset quantity to sell
    });
    
    logger.info(`Sell order executed: ${JSON.stringify(order)}`);
    return order;
  } catch (error) {
    logger.error(`Error executing sell order for ${symbol}: ${error.message}`);
    throw error;
  }
};

// Get account information and balances
const getAccountInfo = async () => {
  try {
    const accountInfo = await binanceClient.accountInfo();
    return accountInfo;
  } catch (error) {
    logger.error(`Error fetching account info: ${error.message}`);
    throw error;
  }
};

module.exports = {
  binanceClient,
  initBinanceWebsockets,
  getCurrentPrice,
  getKlines,
  getSymbols,
  executeBuyOrder,
  executeSellOrder,
  getAccountInfo
};