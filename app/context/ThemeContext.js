'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ isDark: false, toggleDark: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('brainworm-dark-mode');
    if (saved === 'true') setIsDark(true);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDark(true);
  }, []);

  const toggleDark = () => {
    setIsDark(prev => {
      localStorage.setItem('brainworm-dark-mode', !prev);
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      <div style={{ background: isDark ? '#000000' : '#F2F2F7', minHeight: '100vh', transition: 'background 0.3s' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
