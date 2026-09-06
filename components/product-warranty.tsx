function Icon({ type }: { type: "support" | "tools" | "box" | "shield" | "warning" }) {
  const paths = {
    shield: <><path d="M12 3 5.5 5.7v5.1c0 4.2 2.6 7.8 6.5 9.2 3.9-1.4 6.5-5 6.5-9.2V5.7L12 3Z" /><path d="m9.2 11.7 1.8 1.8 3.9-4" /></>,
    support: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 13v4h3v-5H4m16 1v4h-3v-5h3M9 20h6" /></>,
    tools: <><path d="m14 6 4-4 4 4-4 4M3 21l7.5-7.5M5 3l16 16-2 2L3 5l2-2Z" /></>,
    box: <><path d="M4 7h16v14H4zM3 3h18v4H3z" /><path d="M9 12h6" /></>,
    warning: <><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5m0 3h.01" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

export default function ProductWarranty() {
  return (
    <section className="warranty-section">
      <div className="warranty-heading">
        <span className="warranty-kicker"><Icon type="shield" /></span>
        <h2>Garantia e <em>Suporte</em></h2>
        <p>Todos os produtos comercializados pela Tiger Tech 3D contam com garantia oficial do fabricante, respeitando os prazos e condições específicas de cada item. Seguimos rigorosamente os padrões de cada marca para oferecer segurança em toda a jornada.</p>
      </div>

      <div className="warranty-features">
        <article><Icon type="support" /><h3>Suporte técnico especializado</h3><p>Orientação profissional antes, durante e depois da compra.</p></article>
        <article><Icon type="tools" /><h3>Assistência confiável</h3><p>Análise cuidadosa e acompanhamento em cada atendimento.</p></article>
        <article><Icon type="box" /><h3>Peças originais</h3><p>Componentes adequados e compatíveis com cada equipamento.</p></article>
      </div>

      <p className="warranty-note">As condições detalhadas de garantia variam conforme o fabricante e o produto. Nossa equipe está preparada para orientar você durante todo o processo.</p>

      <div className="warranty-alert">
        <h3><Icon type="warning" /> Condições importantes</h3>
        <p>Para solicitações de troca ou devolução:</p>
        <ul>
          <li>O produto deve ser enviado na <strong>embalagem original</strong>;</li>
          <li>Deve acompanhar <strong>todos os acessórios</strong>;</li>
          <li>O equipamento passará por <strong>análise técnica</strong>.</li>
        </ul>
        <p>Caso sejam identificados <strong>mau uso, danos indevidos ou instalação incorreta</strong>, os custos poderão ser de responsabilidade do cliente.</p>
      </div>
    </section>
  );
}
