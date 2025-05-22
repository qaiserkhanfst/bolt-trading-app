const { OpenAI } = require("openai");
const axios = require("axios");
const technicalIndicators = require("technicalindicators");
const dotenv = require("dotenv");
const NodeCache = require("node-cache");
const { getKlines } = require("./binance.service");
const logger = require("../utils/logger");

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize cache with 15 minutes standard TTL
const analysisCache = new NodeCache({ stdTTL: 900 });

// Calculate RSI
const calculateRSI = (prices, period = 14) => {
  const rsiResult = technicalIndicators.RSI.calculate({
    values: prices,
    period: period,
  });
  return rsiResult[rsiResult.length - 1];
};

// Calculate MACD
const calculateMACD = (prices) => {
  const macdInput = {
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  };

  const macdResult = technicalIndicators.MACD.calculate(macdInput);
  return macdResult[macdResult.length - 1];
};

// Get sentiment analysis from crypto news
const getNewsSentiment = async (symbol) => {
  try {
    const baseAsset = symbol.replace("USDT", "");

    // Check cache first
    const cacheKey = `news_${baseAsset}`;
    const cachedNews = analysisCache.get(cacheKey);

    if (cachedNews) {
      return cachedNews;
    }

    // Use CryptoPanic API (free tier)
    const response = await axios.get(
      `https://cryptopanic.com/api/v1/posts/?auth_token=YOUR_TOKEN_HERE&currencies=${baseAsset}&public=true`
    );

    if (!response.data || !response.data.results) {
      return { sentiment: "neutral", articles: [] };
    }

    const articles = response.data.results.slice(0, 5).map((article) => ({
      title: article.title,
      url: article.url,
      source: article.source.title,
      published_at: article.published_at,
      sentiment:
        article.votes.negative > article.votes.positive
          ? "negative"
          : article.votes.positive > article.votes.negative
          ? "positive"
          : "neutral",
    }));

    // Calculate overall sentiment
    const sentimentCounts = articles.reduce(
      (acc, article) => {
        acc[article.sentiment]++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    let overallSentiment = "neutral";
    if (sentimentCounts.positive > sentimentCounts.negative) {
      overallSentiment = "positive";
    } else if (sentimentCounts.negative > sentimentCounts.positive) {
      overallSentiment = "negative";
    }

    const result = { sentiment: overallSentiment, articles };

    // Cache for 30 minutes
    analysisCache.set(cacheKey, result, 1800);

    return result;
  } catch (error) {
    logger.error(`Error fetching news sentiment: ${error.message}`);
    // Return neutral sentiment as fallback
    return { sentiment: "neutral", articles: [] };
  }
};

// Generate AI analysis
const generateAIAnalysis = async (
  symbol,
  marketData,
  technicalIndicators,
  sentiment
) => {
  try {
    // Check cache first
    const cacheKey = `ai_analysis_${symbol}`;
    const cachedAnalysis = analysisCache.get(cacheKey);

    if (cachedAnalysis) {
      return cachedAnalysis;
    }

    // Prepare the prompt for OpenAI
    const prompt = `
      You are a professional cryptocurrency analyst and trader. Analyze the following data for ${symbol} and provide:
      
      1. A clear BUY, SELL, or HOLD recommendation
      2. Take profit (TP) and stop loss (SL) levels with percentages
      3. A risk score from 1-10 (10 being highest risk)
      4. A brief explanation (max 3 sentences) for your recommendation
      
      Market Data:
      - Current Price: ${marketData.price}
      - 24h Change: ${marketData.priceChangePercent}%
      - Volume: ${marketData.volume}
      - 24h High: ${marketData.high}
      - 24h Low: ${marketData.low}
      
      Technical Indicators:
      - RSI (14): ${technicalIndicators.rsi}
      - MACD Line: ${technicalIndicators.macd?.MACD || "N/A"}
      - MACD Signal: ${technicalIndicators.macd?.signal || "N/A"}
      - MACD Histogram: ${technicalIndicators.macd?.histogram || "N/A"}
      
      Market Sentiment:
      - News Sentiment: ${sentiment.sentiment}
      - Latest Headlines: ${sentiment.articles.map((a) => a.title).join(" | ")}
      
      Format your response as JSON with the following fields:
      {
        "recommendation": "BUY|SELL|HOLD",
        "takeProfitPercent": number,
        "stopLossPercent": number,
        "riskScore": number,
        "explanation": "string"
      }
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // changed from gpt-4 to gpt-3.5-turbo for broader access
      messages: [
        {
          role: "system",
          content:
            "You are a professional cryptocurrency trader and analyst specialized in technical and fundamental analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    let analysis;
    try {
      analysis = JSON.parse(completion.choices[0].message.content);

      // Add price targets based on percentages
      analysis.takeProfitPrice =
        marketData.price * (1 + analysis.takeProfitPercent / 100);
      analysis.stopLossPrice =
        marketData.price * (1 - analysis.stopLossPercent / 100);

      // Format prices to appropriate decimal places
      analysis.takeProfitPrice = analysis.takeProfitPrice.toFixed(2);
      analysis.stopLossPrice = analysis.stopLossPrice.toFixed(2);

      // Cache the result for 15 minutes
      analysisCache.set(cacheKey, analysis, 900);

      return analysis;
    } catch (error) {
      logger.error(`Error parsing OpenAI response: ${error.message}`);
      throw new Error("Failed to parse AI analysis");
    }
  } catch (error) {
    logger.error(`Error generating AI analysis: ${error.message}`);
    throw error;
  }
};

// Main function to analyze a coin
const analyzeCoin = async (symbol) => {
  try {
    // Get market data
    const klines = await getKlines(symbol, "1h", 24);
    const closePrices = klines.map((candle) => candle.close);

    // Calculate technical indicators
    const rsi = calculateRSI(closePrices);
    const macd = calculateMACD(closePrices);

    // Get market sentiment
    const sentiment = await getNewsSentiment(symbol);

    // Current market data
    const lastCandle = klines[klines.length - 1];
    const marketData = {
      price: lastCandle.close,
      priceChangePercent: (
        ((lastCandle.close - klines[0].close) / klines[0].close) *
        100
      ).toFixed(2),
      volume: lastCandle.volume,
      high: Math.max(...klines.map((candle) => candle.high)),
      low: Math.min(...klines.map((candle) => candle.low)),
    };

    // Prepare technical indicators data
    const technicalIndicatorsData = {
      rsi,
      macd,
    };

    // Generate AI analysis
    const analysis = await generateAIAnalysis(
      symbol,
      marketData,
      technicalIndicatorsData,
      sentiment
    );

    // Combine all data
    return {
      symbol,
      marketData,
      technicalIndicators: technicalIndicatorsData,
      sentiment,
      analysis,
      timestamp: Date.now(),
    };
  } catch (error) {
    logger.error(`Error analyzing coin ${symbol}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  analyzeCoin,
  calculateRSI,
  calculateMACD,
  getNewsSentiment,
  generateAIAnalysis,
};
