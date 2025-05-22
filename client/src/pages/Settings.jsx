// Settings.jsx
import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="mb-6">
        <label className="block font-semibold mb-2">Theme</label>
        <select
          className="border rounded px-3 py-2"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-2">User Email</label>
        <input
          className="border rounded px-3 py-2 w-full bg-gray-100"
          value={currentUser?.email || ""}
          disabled
        />
      </div>
    </div>
  );
};

export default Settings;
