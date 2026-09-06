"use client";

import Link from "next/link";
import { useState } from "react";
import { CartButton } from "./cart-provider";
import BrandLogo from "./brand-logo";

export const whatsapp =
  "https://wa.me/5500000000000?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20os%20produtos";

export default function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className={`site-header ${solid ? "solid" : ""}`}>
      <Link className="brand" href="/" aria-label="Tiger Tech início">
        <BrandLogo priority />
        <span>TIGER TECH</span>
      </Link>
      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
      >
        {menuOpen ? "×" : "☰"}
      </button>
      <nav className={menuOpen ? "nav open" : "nav"}>
        <Link href="/produtos">Produtos</Link>
        <Link href="/sobre">Sobre</Link>
        <CartButton />
        <a className="nav-cta" href={whatsapp} target="_blank" rel="noreferrer">
          Fale conosco <span>↗</span>
        </a>
      </nav>
    </header>
  );
}
