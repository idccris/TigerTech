"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "./brand-logo";

const adminLinks = [
  { href: "/admin", label: "Painel administrativo" },
  { href: "/admin/catalogo", label: "Catálogo" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/design", label: "Design" },
  { href: "/admin/usuarios", label: "Usuários" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "operator" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session").then((response) => response.ok ? response.json() : null).then((user) => setRole(user?.role || null));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = role === "admin" ? adminLinks : adminLinks.filter((link) => link.href === "/admin/catalogo");
  async function leave() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="admin-navbar" aria-label="Navegação administrativa">
      <Link className="admin-navbar-brand" href="/admin">
        <BrandLogo priority />
        <span>ADMIN</span>
      </Link>
      <button
        type="button"
        className="admin-menu-toggle"
        aria-label={menuOpen ? "Fechar menu administrativo" : "Abrir menu administrativo"}
        aria-controls="admin-navigation-links"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div id="admin-navigation-links" className={menuOpen ? "is-open" : ""}>
        <button className="admin-leave" type="button" onClick={leave}>Voltar ao site</button>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={
              pathname === link.href ? "active" : ""
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
