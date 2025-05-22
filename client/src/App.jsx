import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TradingView from "./pages/TradingView";
import Analysis from "./pages/Analysis";
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { currentUser, loading } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Apply theme to body element
    document.body.className = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  }, [theme]);

  // Debug: log currentUser
  useEffect(() => {
    console.log("Current user:", currentUser);
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!currentUser ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!currentUser ? <Register /> : <Navigate to="/" />}
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute user={currentUser} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trading" element={<TradingView />} />
          <Route path="/analysis/:symbol?" element={<Analysis />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
