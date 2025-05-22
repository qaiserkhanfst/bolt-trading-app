// Portfolio.jsx
import React from "react";
import PortfolioSummary from "../components/dashboard/PortfolioSummary";
import RecentTrades from "../components/dashboard/RecentTrades";

const Portfolio = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Portfolio</h1>
      <PortfolioSummary />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Recent Trades</h2>
        <RecentTrades />
      </div>
    </div>
  );
};

export default Portfolio;
