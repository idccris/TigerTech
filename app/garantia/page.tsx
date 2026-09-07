import type { Metadata } from "next";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

export const metadata: Metadata = {
  title: "Garantia | Tiger Tech 3D",
  description:
    "Conheça as condições de garantia e suporte dos produtos Tiger Tech 3D.",
};

function WarrantyIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 4 40 10v12c0 10.6-6.4 18.5-16 22-9.6-3.5-16-11.4-16-22V10L24 4Z" />
      <path d="m17 24 4.5 4.5L31.5 18" />
    </svg>
  );
}

export default function WarrantyPage() {
  return (
    <main className="security-page warranty-policy-page">
      <SiteHeader solid />
      <section className="security-hero">
        <div className="security-hero-copy">
          <span className="section-kicker">GARANTIA E SUPORTE</span>
          <h1>
            Proteção que
            <br />
            acompanha você.
          </h1>
          <p>
            Produtos com garantia dos fabricantes, sem prejuízo da garantia
            legal e dos direitos previstos no Código de Defesa do Consumidor.
          </p>
        </div>
        <aside className="security-seal" aria-label="Garantia e suporte">
          <div className="security-shield"><WarrantyIcon /></div>
          <span>SUPORTE CONFIÁVEL</span>
          <strong>Garantia oficial</strong>
          <p>Prazos e condições específicas disponíveis em cada produto.</p>
        </aside>
      </section>

      <section className="security-principles" aria-label="Compromissos de garantia">
        <article>
          <div className="security-card-number">01</div>
          <span>FABRICANTES</span>
          <h2>Garantia do produto</h2>
          <p>
            Todos os produtos comercializados possuem
            <strong> garantia oferecida pelos fabricantes</strong>, respeitando
            os prazos e condições específicas de cada item e a garantia legal
            aplicável.
          </p>
        </article>
        <article>
          <div className="security-card-number">02</div>
          <span>BAMBU LAB</span>
          <h2>Distribuição oficial</h2>
          <p>
            Como <strong>distribuidora oficial Bambu Lab no Brasil</strong>,
            seguimos as diretrizes de garantia da marca para oferecer suporte
            confiável a equipamentos e acessórios.
          </p>
        </article>
        <article>
          <div className="security-card-number">03</div>
          <span>ORIENTAÇÃO</span>
          <h2>Suporte em cada etapa</h2>
          <p>
            As condições detalhadas estão disponíveis na página de cada
            produto. Em caso de dúvidas, nossa equipe está pronta para
            <strong> orientar e auxiliar</strong> durante todo o processo.
          </p>
        </article>
      </section>

      <section className="warranty-policy-alert">
        <div className="security-statement-icon"><WarrantyIcon /></div>
        <div>
          <span>ATENÇÃO</span>
          <h2>Condições importantes</h2>
          <p>
            Para solicitações de troca ou devolução, conserve a embalagem
            original e envie todos os itens e acessórios. Após análise técnica,
            se forem identificados <strong>mau uso, danos indevidos ou instalação
            incorreta</strong>, os custos poderão ser de responsabilidade do
            cliente, observada a legislação aplicável.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
