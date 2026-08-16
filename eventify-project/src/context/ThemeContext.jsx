// --- Imports ---
import React, { createContext, useState, useEffect, useContext } from 'react';

// --- Context Creation ---
const ThemeContext = createContext();

// --- Custom Hook for Easy Access ---
export const useTheme = () => useContext(ThemeContext);

// --- Theme Provider Component ---
export const ThemeProvider = ({ children }) => {
  // --- State Management ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // --- Side Effects (Apply Theme & Save to LocalStorage) ---
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- Toggle Handler ---
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Main Render ---
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};