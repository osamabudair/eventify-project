import React, { createContext, useState, useEffect, useContext } from 'react';

// إنشاء الـ Context
const ThemeContext = createContext();

// دالة مخصصة لاستخدام الثيم بسهولة
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // جلب الحالة من التخزين المحلي أو وضعها كنهاري افتراضياً
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // تطبيق الكلاس على كامل الموقع وحفظ الخيار
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};