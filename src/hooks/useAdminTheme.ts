import { useEffect, useState } from "react";

const STORAGE_KEY = "s4a_admin_theme";
export type AdminTheme = "light" | "dark";

const readStored = (): AdminTheme => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const useAdminTheme = () => {
  const [theme, setTheme] = useState<AdminTheme>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return { theme, toggleTheme };
};
