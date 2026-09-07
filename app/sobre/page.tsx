import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader, { whatsapp } from "../../components/site-header";
import SiteFooter from "../../components/site-footer";

export const metadata: Metadata = {
  title: "Sobre | Tiger Tech",
  description: "Conheça nossa história e compromisso com a tecnologia 3D.",
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <SiteHeader solid />
      <section className="about-hero">
        <div>
          <span className="section-kicker">SOBRE A TIGER TECH</span>
          <h1>Tecnologia para transformar ideias em realidade.</h1>
        </div>
        <p>
          Somos especialistas em fabricação digital e aproximamos pessoas e
          empresas das melhores soluções em impressão 3D. Nossa missão é tornar
          a tecnologia mais simples, acessível e produtiva.
        </p>
      </section>
      <section className="about-story">
        <div className="story-visual">
          <span>T</span>
          <div>
            Conhecimento
            <br />
            que gera possibilidades.
          </div>
        </div>
        <div className="story-copy">
          <span className="section-kicker">NOSSA ESSÊNCIA</span>
          <h2>
            Mais que produtos.
            <br />
            Uma parceria para criar.
          </h2>
          <p>
            Selecionamos equipamentos, materiais e acessórios com foco em
            qualidade, confiabilidade e facilidade de uso. Cada cliente recebe
            orientação para escolher a solução adequada ao seu projeto.
          </p>
          <p>
            Do primeiro contato ao pós-venda, construímos uma experiência
            próxima e especializada, atendendo makers, profissionais, escolas e
            empresas de todo o Brasil.
          </p>
          <Link className="primary-button" href="/produtos">
            Conhecer produtos <span>→</span>
          </Link>
        </div>
      </section>
      <section className="values-section">
        <span className="section-kicker">O QUE NOS MOVE</span>
        <div className="values-grid">
          <article>
            <b>01</b>
            <h3>Especialização</h3>
            <p>Conhecimento técnico para orientar escolhas com segurança.</p>
          </article>
          <article>
            <b>02</b>
            <h3>Proximidade</h3>
            <p>Atendimento humano antes, durante e depois da compra.</p>
          </article>
          <article>
            <b>03</b>
            <h3>Inovação</h3>
            <p>Tecnologias atuais para projetos que olham para o futuro.</p>
          </article>
          <article>
            <b>04</b>
            <h3>Confiança</h3>
            <p>Produtos selecionados e suporte para uma jornada tranquila.</p>
          </article>
        </div>
      </section>
      <section className="about-contact">
        <span className="section-kicker">FALE COM A GENTE</span>
        <h2>Vamos criar algo juntos?</h2>
        <p>Conte sobre seu projeto e descubra a solução ideal.</p>
        <a
          className="primary-button"
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          Conversar com especialista <span>↗</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
