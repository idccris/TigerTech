"use client";

import { useEffect } from "react";

export default function AdminLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "light";
    root.style.colorScheme = "light";

    return () => {
      const savedTheme = localStorage.getItem("tiger-theme");
      root.dataset.theme = savedTheme === "dark" ? "dark" : "light";
      root.style.colorScheme = savedTheme === "dark" ? "dark" : "light";
    };
  }, []);

  return null;
}
