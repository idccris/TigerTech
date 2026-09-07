import type { Metadata } from "next";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

export const metadata: Metadata = {
  title: "Segurança | Tiger Tech 3D",
  description:
    "Conheça as medidas adotadas pela Tiger Tech 3D para proteger seus dados e proporcionar uma compra segura.",
};

function ShieldIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 4 40 10v12c0 10.6-6.4 18.5-16 22-9.6-3.5-16-11.4-16-22V10L24 4Z" />
      <path d="m17 24 4.5 4.5L31.5 18" />
    </svg>
  );
}

export default function SecurityPage() {
  return (
    <main className="security-page">
      <SiteHeader solid />

      <section className="security-hero">
        <div className="security-hero-copy">
          <span className="section-kicker">COMPRA PROTEGIDA</span>
          <h1>
            Sua segurança,
            <br />
            nossa prioridade.
          </h1>
          <p>
            Na Tiger Tech 3D, a sua <strong>segurança é prioridade</strong> em
            todas as etapas da compra.
          </p>
        </div>

        <aside className="security-seal" aria-label="Ambiente protegido">
          <div className="security-shield">
            <ShieldIcon />
          </div>
          <span>AMBIENTE PROTEGIDO</span>
          <strong>SSL / TLS</strong>
          <p>Informações transmitidas por conexão segura.</p>
        </aside>
      </section>

      <section
        className="security-principles"
        aria-label="Nossos compromissos de segurança"
      >
        <article>
          <div className="security-card-number">01</div>
          <span>DADOS PESSOAIS</span>
          <h2>Uso responsável</h2>
          <p>
            Seus dados pessoais, como endereço, informações de contato e
            detalhes do pedido, são <strong>utilizados exclusivamente</strong>{" "}
            para o processamento da compra e atendimento. Não vendemos suas
            informações e qualquer compartilhamento é limitado ao necessário
            para pagamento, entrega, segurança ou cumprimento de obrigações
            legais, conforme nossa Política de Privacidade.
          </p>
        </article>

        <article>
          <div className="security-card-number">02</div>
          <span>CONEXÃO SEGURA</span>
          <h2>Tráfego criptografado</h2>
          <p>
            Para garantir ainda mais proteção, utilizamos tecnologias de
            segurança no tráfego de dados, como <strong>criptografia SSL/TLS</strong>,
            assegurando que as informações transmitidas estejam protegidas
            contra acessos não autorizados.
          </p>
        </article>

        <article>
          <div className="security-card-number">03</div>
          <span>ATENDIMENTO</span>
          <h2>Contato direto e seguro</h2>
          <p>
            Os pedidos realizados via WhatsApp seguem um
            <strong> atendimento direto e seguro</strong> com nossa equipe,
            garantindo transparência, confiabilidade e suporte durante todo o
            processo.
          </p>
        </article>
      </section>

      <section className="security-statement">
        <div className="security-statement-icon">
          <ShieldIcon />
        </div>
        <p>
          Comprar na Tiger Tech 3D é contar com
          <strong> tecnologia, segurança e respeito </strong>
          aos seus dados.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
