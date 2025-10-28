import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#34d399',
      accent: '#fbbf24',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#22d3ee'
    }
  },
  blue: {
    name: 'blue',
    colors: {
      primary: '#2563eb',
      secondary: '#0891b2',
      accent: '#7c3aed',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7'
    }
  },
  green: {
    name: 'green',
    colors: {
      primary: '#059669',
      secondary: '#0891b2',
      accent: '#7c3aed',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#047857',
      border: '#bbf7d0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    }
  },
  purple: {
    name: 'purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#c026d3',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#faf5ff',
      text: '#581c87',
      textSecondary: '#7c3aed',
      border: '#e9d5ff',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useLocalStorage('theme', 'light');
  const [customColors, setCustomColors] = useLocalStorage('customColors', {});

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, customColors]);

  const applyTheme = (themeName) => {
    const theme = themes[themeName] || themes.light;
    const colors = { ...theme.colors, ...customColors };
    
    // Apply CSS custom properties
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply dark mode class
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const updateCustomColors = (colors) => {
    setCustomColors(prev => ({ ...prev, ...colors }));
  };

  const resetCustomColors = () => {
    setCustomColors({});
  };

  const getThemeColors = (themeName = currentTheme) => {
    const theme = themes[themeName] || themes.light;
    return { ...theme.colors, ...customColors };
  };

  const value = {
    currentTheme,
    themes: Object.keys(themes),
    colors: getThemeColors(),
    changeTheme,
    updateCustomColors,
    resetCustomColors,
    getThemeColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
