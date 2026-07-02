// ─── Dark Mode Management ──────────────────────────────────────────────────

const THEME_STORAGE_KEY = "theme";

/**
 * Initialize dark mode based on localStorage or system preference.
 * Returns the initial dark mode state.
 */
export function initDarkMode(): boolean {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return isDark;
}

/**
 * Toggle dark mode and persist the preference.
 * Returns the new dark mode state.
 */
export function toggleDarkMode(current: boolean): boolean {
  const next = !current;
  if (next) {
    document.documentElement.classList.add("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "light");
  }
  return next;
}
