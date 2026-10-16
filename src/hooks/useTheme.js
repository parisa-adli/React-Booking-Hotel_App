import { useCallback, useEffect, useState } from "react";

// Keep in sync with the inline script in index.html, which applies the
// theme before first paint.
const THEME_KEY = "stays:theme";
const THEME_COLORS = { light: "#13243f", dark: "#0a1322" };
const darkQuery = "(prefers-color-scheme: dark)";

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
}

export default function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light"
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow the OS setting until the user picks a theme themselves.
  useEffect(() => {
    const media = window.matchMedia(darkQuery);
    function handleChange(event) {
      if (!readSavedTheme()) setTheme(event.matches ? "dark" : "light");
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Storage unavailable: the choice just won't survive a reload.
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
