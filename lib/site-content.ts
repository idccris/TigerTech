export type HomeContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  statOneTitle: string;
  statOneText: string;
  statTwoTitle: string;
  statTwoText: string;
  statThreeTitle: string;
  statThreeText: string;
  faqEyebrow: string;
  faqTitle: string;
  faqDescription: string;
  tickerEnabled: boolean;
  tickerText: string;
  faqs: Array<{ question: string; answer: string }>;
};

export const defaultHomeContent: HomeContent = {
  eyebrow: "Tecnologia que transforma ideias",
  title: "Crie sem",
  highlight: "limites.",
  description: "Impressoras 3D, materiais e acessórios selecionados para transformar projetos em realidade.",
  primaryButton: "Explorar catálogo",
  secondaryButton: "Falar com especialista",
  statOneTitle: "+2 mil",
  statOneText: "clientes atendidos",
  statTwoTitle: "Suporte",
  statTwoText: "especializado",
  statThreeTitle: "Brasil",
  statThreeText: "envio nacional",
  faqEyebrow: "PERGUNTAS FREQUENTES",
  faqTitle: "Ficou com alguma dúvida?",
  faqDescription: "Encontre respostas rápidas sobre produtos, atendimento, pagamento e entrega.",
  tickerEnabled: false,
  tickerText: "TECNOLOGIA • CRIATIVIDADE • IMPRESSÃO 3D • FILAMENTOS • SUPORTE ESPECIALIZADO",
  faqs: [
    { question: "Como escolher a impressora 3D ideal?", answer: "Nosso time ajuda a identificar a solução mais adequada ao seu tipo de projeto, experiência e volume de produção." },
    { question: "A Tiger Tech oferece suporte após a compra?", answer: "Sim. Você conta com orientação especializada antes, durante e depois da compra." },
    { question: "Vocês entregam em todo o Brasil?", answer: "Sim. Realizamos envios para todo o Brasil com acompanhamento do pedido." },
    { question: "Quais são as formas de pagamento?", answer: "Você pode solicitar a compra via Pix ou cartão. Nosso time comercial confirma todas as condições na finalização do pedido." },
  ],
};

export function parseHomeContent(value: string): HomeContent {
  try {
    const parsed = JSON.parse(value || "{}");
    return {
      ...defaultHomeContent,
      ...parsed,
      tickerEnabled: parsed.tickerEnabled === true || parsed.tickerEnabled === "true",
      tickerText: String(parsed.tickerText || defaultHomeContent.tickerText),
      faqs: Array.isArray(parsed.faqs)
        ? parsed.faqs
            .map((item: unknown) => {
              const faq = item as { question?: unknown; answer?: unknown };
              return { question: String(faq?.question || ""), answer: String(faq?.answer || "") };
            })
            .filter((item: { question: string; answer: string }) => item.question && item.answer)
        : defaultHomeContent.faqs,
    };
  } catch {
    return defaultHomeContent;
  }
}
