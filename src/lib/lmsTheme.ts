import { useEffect, useState } from "react";

// The LMS theme: light (white) or dark (navy). Remembered on this device; the classes go on the page,
// so popups (which render elsewhere) follow the theme too. Styles for both live in index.css.
export type LmsTheme = "light" | "dark";
const KEY = "lms_theme";

const read = (): LmsTheme => {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export function useLmsTheme(): [LmsTheme, () => void] {
  const [theme, setTheme] = useState<LmsTheme>(read);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("lms-white", "lms-dark");
    root.classList.add(theme === "dark" ? "lms-dark" : "lms-white");
    try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
    return () => { root.classList.remove("lms-white", "lms-dark"); };
  }, [theme]);

  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}
