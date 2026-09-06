import type { Metadata } from "next";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

export const metadata: Metadata = {
  title: "Pagamento | Tiger Tech 3D",
  description:
    "Conheça as formas e condições de pagamento oferecidas pela Tiger Tech 3D.",
  alternates: { canonical: "/pagamento" },
};

function PaymentIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="5" y="10" width="38" height="28" rx="5" />
      <path d="M5 19h38M12 30h10" />
    </svg>
  );
}

export default function PaymentPage() {
  return (
    <main className="security-page payment-page">
      <SiteHeader solid />
      <section className="security-hero">
        <div className="security-hero-copy">
          <span className="section-kicker">FORMAS DE PAGAMENTO</span>
          <h1>
            Escolha simples.
            <br />
            Compra segura.
          </h1>
          <p>
            Na Tiger Tech 3D, oferecemos <strong>diversas formas de pagamento</strong>
            para facilitar sua compra.
          </p>
        </div>
        <aside className="security-seal" aria-label="Pagamento seguro">
          <div className="security-shield"><PaymentIcon /></div>
          <span>CONDIÇÕES FLEXÍVEIS</span>
          <strong>Pix ou cartão</strong>
          <p>Escolha a modalidade disponível para seu pedido.</p>
        </aside>
      </section>

      <section className="security-principles" aria-label="Como funciona o pagamento">
        <article>
          <div className="security-card-number">01</div>
          <span>INSUMOS E PEÇAS</span>
              <h2>Escolha a forma de pagamento</h2>
          <p>
            Para pedidos realizados pelo site, você poderá escolher a opção
            desejada no momento da finalização, com
            <strong> praticidade e segurança</strong>.
          </p>
        </article>
        <article>
          <div className="security-card-number">02</div>
          <span>EQUIPAMENTOS</span>
          <h2>Condições personalizadas</h2>
          <p>
            Para <strong>equipamentos</strong>, o pagamento é combinado
            diretamente com nosso time via <strong>WhatsApp</strong>, permitindo
            condições personalizadas, negociação e suporte durante o processo.
          </p>
        </article>
        <article>
          <div className="security-card-number">03</div>
          <span>ORIENTAÇÃO</span>
          <h2>Instruções claras</h2>
          <p>
            Após a escolha da forma de pagamento, todas as instruções serão
            enviadas de forma clara e rápida para garantir uma
            <strong> experiência simples e segura</strong>.
          </p>
        </article>
      </section>

      <section className="security-statement">
        <div className="security-statement-icon"><PaymentIcon /></div>
        <p>
          Flexibilidade para escolher. <strong>Segurança para comprar.</strong>
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
