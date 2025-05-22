// NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
    <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
      Page Not Found
    </p>
    <Link
      to="/"
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Go Home
    </Link>
  </div>
);

export default NotFound;
