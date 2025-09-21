export const theme = {
  colors: {
    primary: {
      DEFAULT: '#ea580c', // orange-600
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c', // Main brand color
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },

    // Claude-inspired warm accent color
    accent: {
      DEFAULT: '#C15F3C', // Claude's Crail color
      50: '#fdf4f0',
      100: '#fae8e1',
      200: '#f4cfc3',
      300: '#ecab95',
      400: '#e17d64',
      500: '#C15F3C', // Main Claude accent
      600: '#b5523a',
      700: '#964332',
      800: '#7a392f',
      900: '#64312a',
    },

    gray: {
      50: '#f8fafc',   // slate-50
      100: '#f1f5f9',  // slate-100
      200: '#e2e8f0',  // slate-200
      300: '#cbd5e1',  // slate-300
      400: '#94a3b8',  // slate-400
      500: '#64748b',  // slate-500
      600: '#475569',  // slate-600
      700: '#334155',  // slate-700
      800: '#1e293b',  // slate-800
      900: '#0f172a',  // slate-900
    },

    // Claude's exact neutral colors
    neutral: {
      50: '#F4F3EE',   // Claude's Pampas
      100: '#E9E6E0',
      200: '#D5D0C7',
      300: '#B1ADA1', // Claude's Cloudy
      400: '#9B968C', // Mid-tone
      500: '#7A756B', // Neutral
      600: '#625D54', // Dark neutral
      700: '#404040', // Border color
      800: '#30302E', // Claude's text box color
      900: '#262624', // Claude's exact background
    },

    semantic: {
      success: '#22c55e', // green-500
      error: '#ef4444',   // red-500
      warning: '#f59e0b', // amber-500
      info: '#3b82f6',    // blue-500
    },

    background: {
      light: '#ffffff',
      lightSecondary: '#f8fafc', // slate-50
      dark: '#1A1815',     // Deep warm dark inspired by Claude
      darkSecondary: '#2A2723', // Warmer dark gray
    },

    // Dark mode specific colors (Claude's exact colors)
    dark: {
      background: '#262624', // Claude's exact background
      surface: '#30302E',     // Claude's text box color
      surfaceSecondary: '#3A3A37', // Slightly lighter variant
      border: '#404040',      // Claude's border color
      text: {
        primary: '#E5E5E3',   // Claude's text color
        secondary: '#B1ADA1', // Claude's cloudy
        muted: '#B0B0AE',     // Claude's muted text
      }
    },

    // Light mode specific colors
    light: {
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceSecondary: '#f1f5f9',
      border: '#e2e8f0',
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#64748b',
      }
    }
  },

  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px (default)
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  typography: {
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },

  components: {
    button: {
      primary: 'bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors dark:bg-orange-500 dark:hover:bg-orange-600',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-md transition-colors dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-50',
      outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-md transition-colors dark:border-neutral-600 dark:hover:bg-neutral-800 dark:text-neutral-200',
      ghost: 'hover:bg-slate-100 text-slate-700 font-medium rounded-md transition-colors dark:hover:bg-neutral-800 dark:text-neutral-200',
    },

    card: {
      base: 'bg-white border border-slate-200 rounded-lg shadow-sm dark:bg-neutral-800 dark:border-neutral-700',
      header: 'px-6 py-4 border-b border-slate-200 dark:border-neutral-700',
      content: 'px-6 py-4',
    },

    input: {
      base: 'border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:ring-orange-400',
    },

    badge: {
      primary: 'bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded dark:bg-orange-900/30 dark:text-orange-200',
      secondary: 'bg-slate-100 text-slate-800 text-xs font-medium px-2 py-1 rounded dark:bg-neutral-700 dark:text-neutral-200',
      outline: 'border border-slate-300 text-slate-700 text-xs font-medium px-2 py-1 rounded dark:border-neutral-600 dark:text-neutral-300',
    },

    table: {
      header: 'bg-slate-50 text-slate-700 font-medium text-sm dark:bg-neutral-800 dark:text-neutral-200',
      row: 'border-b border-slate-200 hover:bg-slate-50 transition-colors dark:border-neutral-700 dark:hover:bg-neutral-800/50',
      cell: 'px-4 py-3 text-sm',
    }
  },

  layout: {
    header: {
      height: '4rem', // 64px (h-16)
      background: 'bg-white border-b border-slate-200 dark:bg-neutral-800 dark:border-neutral-600',
      padding: 'px-4 py-4',
    },

    container: {
      maxWidth: '1200px',
      padding: 'px-4',
      margin: 'mx-auto',
    },

    page: {
      background: 'bg-slate-50 min-h-screen dark:bg-neutral-800',
      padding: 'py-8',
    }
  },

  animations: {
    transitions: {
      fast: 'transition-all duration-150 ease-in-out',
      normal: 'transition-all duration-300 ease-in-out',
      slow: 'transition-all duration-500 ease-in-out',
    },

    hover: {
      scale: 'hover:scale-105',
      shadow: 'hover:shadow-lg',
      lift: 'hover:-translate-y-1 hover:shadow-lg',
    }
  }
} as const

// Utility functions for consistent styling
export const getButtonClasses = (variant: keyof typeof theme.components.button = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseClasses = theme.components.button[variant]
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return `${baseClasses} ${sizeClasses[size]}`
}

export const getCardClasses = () => theme.components.card.base

export const getBadgeClasses = (variant: keyof typeof theme.components.badge = 'primary') =>
  theme.components.badge[variant]

export const getInputClasses = () => theme.components.input.base

// Responsive breakpoints (following Tailwind's system)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Brand-specific constants
export const brand = {
  name: 'BondScout',
  tagline: 'Tax-Aware Bond Intelligence',
  description: 'Personalized, tax-aware bond scouting that delivers ranked opportunities',
} as const

// Dark mode utilities
export const darkMode = {
  // Theme toggle modes
  modes: ['light', 'dark', 'system'] as const,

  // CSS class for dark mode
  darkClass: 'dark',

  // Storage key for theme preference
  storageKey: 'bondscout-theme',

  // Utility functions for dark mode colors
  getTextColor: (isDark: boolean) => isDark ? theme.colors.dark.text.primary : theme.colors.light.text.primary,
  getBackgroundColor: (isDark: boolean) => isDark ? theme.colors.dark.background : theme.colors.light.background,
  getSurfaceColor: (isDark: boolean) => isDark ? theme.colors.dark.surface : theme.colors.light.surface,
  getBorderColor: (isDark: boolean) => isDark ? theme.colors.dark.border : theme.colors.light.border,
} as const

export type ThemeMode = typeof darkMode.modes[number]