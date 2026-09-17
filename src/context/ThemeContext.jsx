import { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const THEMES = {
  mantis: {
    id: 'mantis',
    name: 'Mantis',
    bg: '#0F0A0A',
    panel: '#82D173',
    panelText: '#0F0A0A',
    text: '#FFFFFF',
    accent: '#82D173',
    accentHover: '#70c162',
    icon: '🌿',
    colors: ['#0F0A0A', '#82D173', '#FFFFFF']
  },
  asphalt: {
    id: 'asphalt',
    name: 'Asphalt',
    bg: '#302f3c',
    panel: '#efede3',
    panelText: '#18181b',
    text: '#000000',
    accent: '#efede3',
    accentHover: '#dedacf',
    icon: '⚡',
    colors: ['#302f3c', '#efede3', '#000000']
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    bg: '#F4ECEB',
    panel: '#B76E79',
    panelText: '#FFFFFF',
    text: '#000000',
    accent: '#B76E79',
    accentHover: '#a35c67',
    icon: '🌸',
    colors: ['#F4ECEB', '#B76E79', '#000000']
  }
};

const ThemeContext = createContext({
  theme: 'mantis',
  themeConfig: THEMES.mantis,
  setTheme: () => {},
  themes: THEMES
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return THEMES[saved] ? saved : 'mantis';
  });

  const setTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
      localStorage.setItem('app_theme', newTheme);
    }
  };

  const themeConfig = useMemo(() => THEMES[theme] || THEMES.mantis, [theme]);

  // Apply CSS custom variables and theme class to document body / root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    root.style.setProperty('--theme-bg', themeConfig.bg);
    root.style.setProperty('--theme-panel', themeConfig.panel);
    root.style.setProperty('--theme-panel-text', themeConfig.panelText);
    root.style.setProperty('--theme-text', themeConfig.text);
    root.style.setProperty('--theme-accent', themeConfig.accent);

    document.body.style.backgroundColor = themeConfig.bg;
    document.body.style.color = themeConfig.text;
  }, [theme, themeConfig]);

  const value = useMemo(() => ({
    theme,
    themeConfig,
    setTheme,
    themes: THEMES
  }), [theme, themeConfig]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
