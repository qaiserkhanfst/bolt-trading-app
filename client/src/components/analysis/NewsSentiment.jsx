import { useState } from 'react';

const NewsSentiment = ({ analysis }) => {
  const [expandedArticle, setExpandedArticle] = useState(null);
  
  if (!analysis || !analysis.sentiment || !analysis.sentiment.articles) {
    return (
      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-white mb-4">News & Sentiment Analysis</h2>
        <div className="text-gray-400">No news data available</div>
      </div>
    );
  }
  
  const { sentiment } = analysis;
  
  // Get sentiment color
  const getSentimentColor = (articleSentiment) => {
    if (articleSentiment === 'positive') return 'text-green-500';
    if (articleSentiment === 'negative') return 'text-red-500';
    return 'text-amber-500';
  };
  
  const getSentimentBgColor = (articleSentiment) => {
    if (articleSentiment === 'positive') return 'bg-green-500/20';
    if (articleSentiment === 'negative') return 'bg-red-500/20';
    return 'bg-amber-500/20';
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">News & Sentiment Analysis</h2>
        <div className={`px-3 py-1 rounded-full ${getSentimentBgColor(sentiment.sentiment)} ${getSentimentColor(sentiment.sentiment)}`}>
          {sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)} Sentiment
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-3">Sentiment Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 mb-1">Overall Sentiment</div>
            <div className={`text-xl font-bold ${getSentimentColor(sentiment.sentiment)} capitalize`}>
              {sentiment.sentiment}
            </div>
          </div>
          
          <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 mb-1">Articles Analyzed</div>
            <div className="text-xl font-bold text-white">
              {sentiment.articles.length}
            </div>
          </div>
          
          <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 mb-1">Market Impact</div>
            <div className={`text-xl font-bold ${
              sentiment.sentiment === 'positive' ? 'text-green-500' : 
              sentiment.sentiment === 'negative' ? 'text-red-500' : 'text-amber-500'
            }`}>
              {sentiment.sentiment === 'positive' ? 'Bullish' : 
               sentiment.sentiment === 'negative' ? 'Bearish' : 'Neutral'}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Recent Articles</h3>
        
        {sentiment.articles.length > 0 ? (
          <div className="space-y-4">
            {sentiment.articles.map((article, index) => (
              <div 
                key={index} 
                className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-blue-500/40 transition-colors cursor-pointer"
                onClick={() => setExpandedArticle(expandedArticle === index ? null : index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{article.title}</h4>
                  <div className={`ml-3 px-2 py-0.5 rounded-full text-xs ${getSentimentBgColor(article.sentiment)} ${getSentimentColor(article.sentiment)}`}>
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <div>{article.source}</div>
                  <div>{formatDate(article.published_at)}</div>
                </div>
                
                {expandedArticle === index && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-gray-300 mb-3">
                      This article from {article.source} has a {article.sentiment} sentiment that could impact {analysis.symbol.replace('USDT', '')} price.
                    </p>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 text-sm inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Read full article →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No recent articles found</div>
        )}
      </div>
    </div>
  );
};

export default NewsSentiment;