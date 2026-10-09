import { ThemeMode } from '../types/profile';

const THEME_STORAGE_KEY = 'aquamind_theme_preference';

/**
 * Retrieves the stored theme preference from localStorage.
 * Defaults to 'system'.
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // Fallback if localStorage is inaccessible
  }
  return 'system';
}

/**
 * Persists the theme preference to localStorage.
 */
export function setStoredTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage write failure fallback
  }
}

/**
 * Evaluates whether 'dark' or 'light' should be active given the selected ThemeMode.
 */
export function getEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  // System preference detection
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Applies the given theme immediately to documentElement.
 * Adds/removes the 'dark' CSS class and sets data-theme attribute.
 */
export function applyTheme(theme: ThemeMode): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const effective = getEffectiveTheme(theme);
  const root = document.documentElement;

  if (effective === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  return effective;
}
