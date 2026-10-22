"use client";

import { useEffect } from "react";

export default function AdminLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("tiger-theme");
    const theme = savedTheme === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    return () => {
      const savedTheme = localStorage.getItem("tiger-theme");
      root.dataset.theme = savedTheme === "light" ? "light" : "dark";
      root.style.colorScheme = savedTheme === "light" ? "light" : "dark";
    };
  }, []);

  return null;
}
