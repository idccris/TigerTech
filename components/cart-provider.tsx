"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "../lib/products";

type CartItem = Pick<Product, "slug" | "name" | "tone" | "category"> & {
  quantity: number;
  pixPriceCents: number;
  cardPriceCents: number;
};
type CartContextValue = {
  items: CartItem[];
  count: number;
  add: (product: Product) => void;
  change: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  open: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "">("");

  useEffect(() => {
    async function restoreCart() {
      let savedItems: CartItem[] = [];
      try {
        const saved = localStorage.getItem("nova-cart");
        if (saved) savedItems = JSON.parse(saved);
      } catch {
        localStorage.removeItem("nova-cart");
      }
      try {
        if (savedItems.length === 0) {
          setItems([]);
          setLoaded(true);
          return;
        }
        const response = await fetch("/api/products", { cache: "no-store" });
        if (response.ok) {
          const products = (await response.json()) as Product[];
          const prices = new Map(
            products.map((product) => [product.slug, {
              pixPriceCents: product.priceCents || 0,
              cardPriceCents: product.cardPriceCents || product.priceCents || 0,
            }]),
          );
          savedItems = savedItems
            .filter((item) => prices.has(item.slug))
            .map((item) => ({
              ...item,
              pixPriceCents: prices.get(item.slug)?.pixPriceCents ?? item.pixPriceCents ?? 0,
              cardPriceCents: prices.get(item.slug)?.cardPriceCents ?? item.cardPriceCents ?? item.pixPriceCents ?? 0,
            }));
        }
      } catch {
        // Mantém o carrinho local quando a atualização estiver indisponível.
      }
      setItems(savedItems);
      setLoaded(true);
    }
    restoreCart();
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("nova-cart", JSON.stringify(items));
  }, [items, loaded]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      add: (product) => {
        setItems((current) => {
          const found = current.find((item) => item.slug === product.slug);
          return found
            ? current.map((item) =>
                item.slug === product.slug
                  ? {
                      ...item,
                      quantity: item.quantity + 1,
                      pixPriceCents: product.priceCents || 0,
                      cardPriceCents: product.cardPriceCents || product.priceCents || 0,
                    }
                  : item,
              )
            : [
                ...current,
                {
                  slug: product.slug,
                  name: product.name,
                  tone: product.tone,
                  category: product.category,
                  quantity: 1,
                  pixPriceCents: product.priceCents || 0,
                  cardPriceCents: product.cardPriceCents || product.priceCents || 0,
                },
              ];
        });
        setCheckoutOpen(true);
        setIsOpen(true);
      },
      change: (slug, quantity) =>
        setItems((current) =>
          current.map((item) =>
            item.slug === slug
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        ),
      remove: (slug) =>
        setItems((current) => current.filter((item) => item.slug !== slug)),
      open: () => {
        setCheckoutOpen(true);
        setIsOpen(true);
      },
    }),
    [items],
  );
  const selectedTotalCents = items.reduce(
    (total, item) => total + (paymentMethod === "pix" ? item.pixPriceCents : item.cardPriceCents || item.pixPriceCents || 0) * item.quantity,
    0,
  );
  const money = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  async function finishOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setCheckoutError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          document: form.get("document"),
          address: form.get("address"),
        },
        items: items.map(({ slug, quantity }) => ({ slug, quantity })),
        paymentMethod,
      }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setCheckoutError(result.error || "Não foi possível finalizar o pedido.");
      return;
    }
    setItems([]);
    setCheckoutOpen(false);
    setOrderSuccess(result.orderId);
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      {isOpen && (
        <div className="cart-overlay" onClick={() => setIsOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-head">
              <div>
                <span>SEU CARRINHO</span>
                <h2>
                  {value.count} {value.count === 1 ? "item" : "itens"}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)}>×</button>
            </div>
            {orderSuccess ? (
              <div className="cart-success">
                <span>✓</span>
                <strong>Pedido recebido!</strong>
                <p>
                  Seu pedido foi registrado em nosso sistema e dentro de alguns
                  instantes nosso time comercial entrará em contato para
                  finalizar.
                </p>
                <b>{orderSuccess}</b>
                <button
                  onClick={() => {
                    setOrderSuccess("");
                    setIsOpen(false);
                  }}
                >
                  Continuar navegando
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="cart-empty">
                <strong>Seu carrinho está vazio</strong>
                <p>Explore o catálogo e adicione os produtos desejados.</p>
                <Link href="/#produtos" onClick={() => setIsOpen(false)}>
                  Ver produtos
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map((item) => (
                    <article className="cart-item" key={item.slug}>
                      <div className={`cart-thumb ${item.tone}`}>N</div>
                      <div>
                        <span>{item.category}</span>
                        <Link
                          href={`/produto/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                        <div className="quantity">
                          <button
                            onClick={() =>
                              value.change(item.slug, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <b>{item.quantity}</b>
                          <button
                            onClick={() =>
                              value.change(item.slug, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <small className="cart-item-price">
                          {paymentMethod ? money(((paymentMethod === "pix" ? item.pixPriceCents : item.cardPriceCents) || 0) * item.quantity) : "Selecione o pagamento"}
                        </small>
                      </div>
                      <button
                        className="remove-item"
                        onClick={() => value.remove(item.slug)}
                      >
                        Remover
                      </button>
                    </article>
                  ))}
                </div>
                {checkoutOpen ? (
                  <form className="checkout-form" onSubmit={finishOrder}>
                    <div className="checkout-title">
                      <div>
                        <span>FINALIZAÇÃO</span>
                        <strong>Dados do cliente</strong>
                      </div>
                    </div>
                    <label>
                      Nome completo
                      <input name="name" required maxLength={120} />
                    </label>
                    <div className="checkout-columns">
                      <label>
                        E-mail
                        <input
                          name="email"
                          type="email"
                          required
                          maxLength={160}
                        />
                      </label>
                      <label>
                        Telefone
                        <input name="phone" required maxLength={40} />
                      </label>
                    </div>
                    <label>
                      CPF ou CNPJ
                      <input name="document" required maxLength={40} />
                    </label>
                    <label>
                      Endereço
                      <textarea name="address" required rows={2} maxLength={300} />
                    </label>
                    <fieldset className="payment-options">
                      <legend>Forma de pagamento</legend>
                      <label className={paymentMethod === "pix" ? "selected" : ""}>
                        <input type="radio" name="paymentMethod" value="pix" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} />
                        <span><b>Pix</b><small>Pagamento à vista com desconto</small></span>
                      </label>
                      <label className={paymentMethod === "card" ? "selected" : ""}>
                        <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                        <span><b>Cartão</b><small>Valor no cartão</small></span>
                      </label>
                    </fieldset>
                    {paymentMethod ? <div className="checkout-total"><span>Total do pedido <small>({paymentMethod === "pix" ? "no Pix" : "no cartão"})</small></span><strong>{money(selectedTotalCents)}</strong></div> : <p className="payment-hint">Selecione a forma de pagamento para ver o valor do pedido.</p>}
                    {checkoutError ? (
                      <p className="checkout-error">{checkoutError}</p>
                    ) : null}
                    <button disabled={submitting || !paymentMethod}>
                      {submitting ? "Processando..." : "Confirmar pedido"}
                    </button>
                  </form>
                ) : (
                  <div className="cart-summary">
                    <div>
                      <span>Valor do pedido</span>
                      <strong>Definido na finalização</strong>
                    </div>
                    <p>
                      Confira os produtos e informe seus dados para registrar o
                      pedido.
                    </p>
                    <button
                      onClick={() => {
                        setCheckoutError("");
                        setPaymentMethod("");
                        setCheckoutOpen(true);
                      }}
                    >
                      Finalizar pedido
                    </button>
                    <small>Os itens permanecerão salvos neste navegador.</small>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de CartProvider");
  return context;
}

export function CartButton() {
  const { count, open } = useCart();
  return (
    <button className="nav-cart" onClick={open}>
      Carrinho <span>{count}</span>
    </button>
  );
}
