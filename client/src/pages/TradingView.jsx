// TradingView.jsx
import React from "react";
import PriceChart from "../components/analysis/PriceChart";
import TechnicalIndicators from "../components/analysis/TechnicalIndicators";
import NewsSentiment from "../components/analysis/NewsSentiment";
import CoinSelector from "../components/common/CoinSelector";

const TradingView = () => {
  const [symbol, setSymbol] = React.useState("BTCUSDT");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trading View</h1>
      <CoinSelector selected={symbol} onChange={setSymbol} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <PriceChart symbol={symbol} />
          <TechnicalIndicators symbol={symbol} />
        </div>
        <div>
          <NewsSentiment symbol={symbol} />
        </div>
      </div>
    </div>
  );
};

export default TradingView;
