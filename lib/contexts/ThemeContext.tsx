'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeMode, darkMode } from '@/lib/themes'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load theme from localStorage on mount, or use system preference
    const storedTheme = localStorage.getItem(darkMode.storageKey) as ThemeMode
    if (storedTheme && darkMode.modes.includes(storedTheme)) {
      setThemeState(storedTheme)
    } else {
      // If no stored preference, explicitly set to system
      setThemeState('system')
    }
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement
      root.classList.remove(darkMode.darkClass)

      let isDarkMode = false

      if (theme === 'system') {
        isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        isDarkMode = theme === 'dark'
      }

      if (isDarkMode) {
        root.classList.add(darkMode.darkClass)
      }

      setIsDark(isDarkMode)
    }

    updateTheme()

    // Listen for system theme changes when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateTheme)
      return () => mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [theme])

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem(darkMode.storageKey, newTheme)
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemPreference ? 'light' : 'dark')
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light')
    }
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}