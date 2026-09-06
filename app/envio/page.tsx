import type { Metadata } from "next";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

export const metadata: Metadata = {
  title: "Envio | Tiger Tech 3D",
  description:
    "Entenda os prazos, o processamento e o rastreamento dos envios da Tiger Tech 3D.",
  alternates: { canonical: "/envio" },
};

function PackageIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="m7 14 17-9 17 9-17 9L7 14Z" />
      <path d="M7 14v20l17 9 17-9V14M24 23v20M15 10l17 9" />
    </svg>
  );
}

export default function ShippingPage() {
  return (
    <main className="security-page shipping-page">
      <SiteHeader solid />

      <section className="security-hero">
        <div className="security-hero-copy">
          <span className="section-kicker">ENTREGA TIGER TECH</span>
          <h1>
            Do nosso estoque
            <br />
            até você.
          </h1>
          <p>
            Processamento ágil, acompanhamento completo e transparência em
            todas as etapas do envio.
          </p>
        </div>

        <aside className="security-seal" aria-label="Envio acompanhado">
          <div className="security-shield">
            <PackageIcon />
          </div>
          <span>PROCESSAMENTO ÁGIL</span>
          <strong>Até 24h úteis</strong>
          <p>Para pedidos de insumos e peças após a confirmação do pagamento.</p>
        </aside>
      </section>

      <section
        className="security-principles"
        aria-label="Etapas do envio"
      >
        <article>
          <div className="security-card-number">01</div>
          <span>PROCESSAMENTO</span>
          <h2>Separação rápida</h2>
          <p>
            Os pedidos de <strong>insumos e peças</strong> realizados pelo site
            são processados rapidamente após a confirmação do pagamento, com
            <strong> envio em até 24 horas úteis</strong>.
          </p>
        </article>

        <article>
          <div className="security-card-number">02</div>
          <span>PRAZO DE ENTREGA</span>
          <h2>Agilidade em todo o Brasil</h2>
          <p>
            O prazo varia conforme a região e a modalidade escolhida, seguindo
            padrões logísticos similares aos grandes marketplaces, como o
            <strong> Mercado Livre</strong>, com prioridade para agilidade e
            eficiência na entrega.
          </p>
        </article>

        <article>
          <div className="security-card-number">03</div>
          <span>RASTREAMENTO</span>
          <h2>Acompanhe cada etapa</h2>
          <p>
            Assim que o pedido for despachado, você receberá o
            <strong> código de rastreamento</strong> para acompanhar cada etapa
            da entrega em tempo real.
          </p>
        </article>
      </section>

      <section className="security-statement shipping-statement">
        <div className="security-statement-icon">
          <PackageIcon />
        </div>
        <div>
          <span>EQUIPAMENTOS</span>
          <p>
            Para equipamentos adquiridos via atendimento pelo WhatsApp, nossa
            equipe informa prazos, disponibilidade e condições de envio de
            forma personalizada, garantindo <strong>total transparência</strong>
            durante todo o processo.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
