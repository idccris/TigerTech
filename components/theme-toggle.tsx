"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === "dark");
    sync();
    const onStorage = (event: StorageEvent) => { if (event.key === "tiger-theme") { document.documentElement.dataset.theme = event.newValue === "dark" ? "dark" : "light"; sync(); } };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    setDark(next);
    try { localStorage.setItem("tiger-theme", next ? "dark" : "light"); } catch {}
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-pressed={dark} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"} title={dark ? "Modo claro" : "Modo escuro"}>
    <span aria-hidden="true">{dark ? "☀" : "☾"}</span><span className="theme-toggle-label">{dark ? "Claro" : "Escuro"}</span>
  </button>;
}
