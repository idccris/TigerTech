"use client";

import { useEffect, useState } from "react";
import { isFilament } from "../lib/product-variants";
import type { Product } from "../lib/products";

type Fields = Pick<Product, "category" | "filamentModel" | "colorName" | "colorHex">;

const initialTypes = ["BASIC", "MATTE", "SILK"];

export default function FilamentFields({ value, onChange, adminPassword = "" }: { value: Fields; onChange: (fields: Partial<Fields>) => void; adminPassword?: string }) {
  const [types, setTypes] = useState(initialTypes);
  const [newType, setNewType] = useState("");
  const [message, setMessage] = useState("");
  const filament = isFilament(value);
  useEffect(() => {
    if (!filament) return;
    fetch("/api/admin/filament-types", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : initialTypes)
      .then((data) => setTypes(Array.isArray(data) && data.length ? data : initialTypes))
      .catch(() => setTypes(initialTypes));
  }, [filament]);
  if (!filament) return null;
  const selectedType = value.filamentModel || "";
  const availableTypes = selectedType && !types.includes(selectedType)
    ? [...types, selectedType].sort((a, b) => a.localeCompare(b, "pt-BR"))
    : types;
  async function addType() {
    if (!newType.trim()) return;
    setMessage("");
    const response = await fetch("/api/admin/filament-types", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newType, adminPassword }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || "Não foi possível adicionar o tipo.");
    const savedType = String(data.name || newType).trim();
    setTypes((current) => [...new Set([...current, savedType])].sort((a, b) => a.localeCompare(b, "pt-BR")));
    onChange({ filamentModel: savedType });
    setNewType("");
    setMessage("Tipo adicionado.");
  }
  return <fieldset className="filament-fields">
    <legend>Tipo e cor do filamento</legend>
    <p>Produtos da mesma marca e do mesmo tipo aparecem juntos no catálogo, com uma bolinha para cada cor.</p>
    <label>Tipo/modelo do filamento<select value={selectedType} required onChange={(event) => onChange({ filamentModel: event.target.value })}><option value="">Selecione o tipo</option>{availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
    <span className="add-category filament-type-add"><input maxLength={80} value={newType} onChange={(event) => setNewType(event.target.value)} placeholder="Adicionar novo tipo/modelo" /><button type="button" onClick={addType}>+ Adicionar</button></span>
    <div className="design-row">
      <label>Nome da cor<input maxLength={60} value={value.colorName || ""} required placeholder="Ex.: Azul" onChange={(event) => onChange({ colorName: event.target.value, colorHex: value.colorHex || "#2563eb" })} /></label>
      <label>Cor da bolinha<input type="color" value={value.colorHex || "#2563eb"} onChange={(event) => onChange({ colorHex: event.target.value })} /></label>
    </div>
    <small>Cadastre cada cor com SKU, foto, preço e estoque próprios. Para separar produtos no catálogo, escolha tipos diferentes.</small>
    {message ? <small className="filament-type-message" role="status">{message}</small> : null}
  </fieldset>;
}
