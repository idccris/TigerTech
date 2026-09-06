"use client";

import { useState, type InputHTMLAttributes } from "react";

export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return <span className="password-input-wrap">
    <input {...props} type={visible ? "text" : "password"} />
    <button type="button" className="password-visibility" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visible} onClick={() => setVisible((current) => !current)}>
      {visible ? "Ocultar" : "Mostrar"}
    </button>
  </span>;
}
