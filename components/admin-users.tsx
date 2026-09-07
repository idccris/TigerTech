"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "./admin-navbar";

type User = { username: string; display_name: string; role: "admin" | "operator"; active: boolean };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const load = () => fetch("/api/admin/users").then((r) => r.ok ? r.json() : []).then(setUsers);
  useEffect(() => { load(); }, []);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Não foi possível criar o usuário.");
    setMessage("Usuário salvo com sucesso.");
    setOpen(false);
    load();
    event.currentTarget.reset();
  }
  async function toggle(user: User) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: user.username, active: !user.active }) });
    if (!response.ok) setMessage((await response.json()).error);
    else load();
  }
  return <main className="admin-users-page"><AdminNavbar />
    <header className="users-hero"><div><span>CONTROLE DE ACESSO</span><h1>Usuários</h1><p>Administradores possuem acesso completo. Operadores acessam somente o catálogo.</p></div><button onClick={() => setOpen(true)}>+ Novo usuário</button></header>
    <section className="users-list">
      {users.map((user) => <article key={user.username}><div><strong>{user.display_name || user.username}</strong><span>@{user.username}</span></div><em className={user.role}>{user.role === "admin" ? "Administrador" : "Operador"}</em><small>{user.active ? "Acesso ativo" : "Desativado"}</small><button onClick={() => toggle(user)}>{user.active ? "Desativar" : "Ativar"}</button></article>)}
    </section>
    {open ? <div className="user-modal"><form onSubmit={create}><div><h2>Novo usuário</h2><button type="button" onClick={() => setOpen(false)}>×</button></div><label>Nome<input name="displayName" required /></label><label>Usuário<input name="username" required minLength={3} /></label><label>Senha<input name="password" type="password" minLength={12} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{12,}" title="Use pelo menos 12 caracteres, incluindo letras e números." required /></label><label>Permissão<select name="role"><option value="operator">Operador — somente catálogo</option><option value="admin">Administrador — acesso completo</option></select></label><button>Salvar usuário</button></form></div> : null}
    {message ? <p className="users-message">{message}</p> : null}
  </main>;
}
