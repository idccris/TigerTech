"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "./admin-navbar";
import PasswordInput from "./password-input";

type User = { username: string; display_name: string; role: "admin" | "operator"; active: boolean };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [recovering, setRecovering] = useState<User | null>(null);
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
  async function recover(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recovering) return;
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "reset-password",
        username: recovering.username,
        newPassword: form.get("newPassword"),
        adminPassword: form.get("adminPassword"),
      }),
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Não foi possível recuperar a conta.");
    setMessage(`Conta de @${recovering.username} recuperada com sucesso.`);
    setRecovering(null);
    load();
  }
  return <main className="admin-users-page"><AdminNavbar />
    <header className="users-hero"><div><span>CONTROLE DE ACESSO</span><h1>Usuários</h1><p>Administradores possuem acesso completo. Operadores acessam somente o catálogo.</p></div><button onClick={() => setOpen(true)}>+ Novo usuário</button></header>
    <section className="users-list" aria-label="Usuários cadastrados">
      {users.map((user) => <article key={user.username}>
        <div className="user-identity"><strong>{user.display_name || user.username}</strong><span>@{user.username}</span></div>
        <div className="user-meta"><em className={user.role}>{user.role === "admin" ? "Administrador" : "Operador"}</em><small className={user.active ? "active" : "inactive"}>{user.active ? "Acesso ativo" : "Desativado"}</small></div>
        <div className="user-actions"><button onClick={() => setRecovering(user)}>Recuperar conta</button><button onClick={() => toggle(user)}>{user.active ? "Desativar" : "Ativar"}</button></div>
      </article>)}
    </section>
    {open ? <div className="user-modal" role="dialog" aria-modal="true" aria-labelledby="new-user-title"><form onSubmit={create}><div><h2 id="new-user-title">Novo usuário</h2><button type="button" aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div><label>Nome<input name="displayName" autoComplete="name" required /></label><label>Usuário<input name="username" autoComplete="username" required minLength={3} /></label><label>Senha<PasswordInput name="password" autoComplete="new-password" minLength={12} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{12,}" title="Use pelo menos 12 caracteres, incluindo letras e números." required /></label><label>Permissão<select name="role"><option value="operator">Operador — somente catálogo</option><option value="admin">Administrador — acesso completo</option></select></label><button>Salvar usuário</button></form></div> : null}
    {recovering ? <div className="user-modal" role="dialog" aria-modal="true" aria-labelledby="recover-user-title"><form onSubmit={recover}><div><h2 id="recover-user-title">Recuperar conta</h2><button type="button" aria-label="Fechar" onClick={() => setRecovering(null)}>×</button></div><p className="recovery-user">Redefinir o acesso de <strong>@{recovering.username}</strong>.</p><label>Nova senha<PasswordInput name="newPassword" autoComplete="new-password" minLength={12} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{12,}" title="Use pelo menos 12 caracteres, incluindo letras e números." required /></label><label>Sua senha de administrador<PasswordInput name="adminPassword" required autoComplete="current-password" /></label><small className="recovery-note">A conta será ativada e todas as sessões antigas serão encerradas.</small><button>Redefinir senha</button></form></div> : null}
    {message ? <p className="users-message" aria-live="polite">{message}</p> : null}
  </main>;
}
