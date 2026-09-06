import type { Metadata } from "next";
import LegalDocument from "../../components/legal-document";

export const metadata: Metadata = {
  title: "Política de Privacidade | Tiger Tech 3D",
  description:
    "Saiba como a Tiger Tech 3D coleta, utiliza, armazena e protege seus dados pessoais.",
  alternates: { canonical: "/politica-de-privacidade" },
};

const index = [
  "Quem pode utilizar",
  "Dados e finalidades",
  "Cookies e armazenamento local",
  "Compartilhamento",
  "Armazenamento",
  "Direitos do titular",
  "Segurança",
  "Alterações",
  "Contato",
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      kicker="PRIVACIDADE E TRANSPARÊNCIA"
      title="Política de Privacidade"
      lead={
        <>
          A <strong>Tiger Tech 3D</strong> valoriza a transparência e a
          segurança no tratamento de dados pessoais. Esta Política explica como
          coletamos, utilizamos e protegemos suas informações em conformidade
          com a Lei nº 13.709/2018 — LGPD.
        </>
      }
      index={index}
    >
      <div className="legal-update">Última atualização: 30 de agosto de 2026</div>

      <section>
        <span>01</span>
        <h2>Quem pode utilizar nosso site</h2>
        <p>
          Nosso site é destinado a pessoas com 18 anos ou mais. Não realizamos
          coleta intencional de dados de crianças ou adolescentes.
        </p>
      </section>

      <section>
        <span>02</span>
        <h2>Dados que coletamos e suas finalidades</h2>
        <h3>2.1 Dados fornecidos pelo usuário</h3>
        <p>Durante a finalização de um pedido, podemos coletar:</p>
        <ul>
          <li>Nome completo</li>
          <li>E-mail e telefone</li>
          <li>CPF ou CNPJ, quando informado</li>
          <li>Endereço, quando informado</li>
          <li>Produtos, quantidades, valores e forma de pagamento escolhida</li>
          <li>Informações enviadas durante o atendimento</li>
        </ul>
        <p>
          <strong>Finalidades:</strong> processar pedidos e solicitações,
          manter o histórico comercial, prestar atendimento, cumprir obrigações
          legais e viabilizar o contato pelo site ou WhatsApp.
        </p>

        <h3>2.2 Dados técnicos coletados automaticamente</h3>
        <p>
          Os sistemas de hospedagem e segurança podem processar endereço IP,
          tipo de navegador, dispositivo, data, horário, páginas acessadas e
          localização aproximada derivada do IP. Esses dados são utilizados
          para segurança, prevenção de fraudes, funcionamento e melhoria de
          desempenho da plataforma.
        </p>

        <h3>2.3 Dados sensíveis</h3>
        <p>
          A Tiger Tech 3D <strong>não solicita intencionalmente dados pessoais
          sensíveis</strong>, conforme definidos pela LGPD.
        </p>
      </section>

      <section>
        <span>03</span>
        <h2>Cookies e armazenamento local</h2>
        <p>
          Utilizamos tecnologias estritamente necessárias ao funcionamento do
          site. O carrinho pode ser mantido no armazenamento local do seu
          navegador, permitindo preservar os itens durante a navegação. A área
          administrativa utiliza cookie de sessão protegido para autenticação.
        </p>
        <p>
          Você pode apagar cookies e dados locais nas configurações do
          navegador, mas isso poderá encerrar sessões ou remover os produtos do
          carrinho.
        </p>
      </section>

      <section>
        <span>04</span>
        <h2>Compartilhamento de dados</h2>
        <p>
          Seus dados <strong>não são vendidos</strong>. O compartilhamento é
          limitado ao necessário para:
        </p>
        <ul>
          <li>Cumprimento de obrigações legais ou determinações de autoridades</li>
          <li>Processamento de pagamentos, quando aplicável</li>
          <li>Operação logística, transporte e entrega de pedidos</li>
          <li>Hospedagem, banco de dados, segurança e funcionamento do site</li>
        </ul>
        <p>
          Esses prestadores atuam somente dentro das finalidades necessárias à
          prestação do serviço e conforme as obrigações aplicáveis de proteção
          de dados.
        </p>
      </section>

      <section>
        <span>05</span>
        <h2>Armazenamento dos dados</h2>
        <p>
          Os dados são mantidos pelo período necessário ao processamento dos
          pedidos, atendimento e cumprimento de obrigações legais, fiscais e
          regulatórias. Encerrado o período aplicável, poderão ser excluídos ou
          anonimizados de forma segura.
        </p>
      </section>

      <section>
        <span>06</span>
        <h2>Seus direitos como titular</h2>
        <p>Nos termos da LGPD, você poderá solicitar, quando aplicável:</p>
        <ul>
          <li>Confirmação e acesso aos dados</li>
          <li>Correção de informações incompletas ou desatualizadas</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
          <li>Informações sobre compartilhamentos</li>
          <li>Revogação de consentimento</li>
          <li>Exclusão, respeitadas as hipóteses legais de conservação</li>
        </ul>
      </section>

      <section>
        <span>07</span>
        <h2>Segurança das informações</h2>
        <p>Adotamos medidas técnicas e organizacionais, incluindo:</p>
        <ul>
          <li>Transmissão protegida por HTTPS com criptografia SSL/TLS</li>
          <li>Armazenamento em infraestrutura protegida</li>
          <li>Controle de acesso restrito à área administrativa</li>
          <li>Senhas administrativas armazenadas por hash seguro</li>
        </ul>
        <p>
          Nenhum sistema é totalmente imune a riscos. Em caso de incidente
          relevante, adotaremos as providências e comunicações exigidas pela
          legislação.
        </p>
      </section>

      <section>
        <span>08</span>
        <h2>Alterações nesta política</h2>
        <p>
          Esta Política poderá ser atualizada para refletir mudanças legais,
          operacionais ou melhorias no site. A data da versão mais recente será
          sempre indicada no início desta página.
        </p>
      </section>

      <section>
        <span>09</span>
        <h2>Contato e controlador</h2>
        <p>
          <strong>ECOMPLEX BRASIL COMÉRCIO ONLINE LTDA.</strong><br />
          CNPJ 54.570.656/0001-79<br />
          Nome comercial: Tiger Tech 3D
        </p>
        <div className="legal-contact">
          <a href="mailto:contato@tigertech3d.com.br">
            contato@tigertech3d.com.br
          </a>
          <a href="https://wa.me/5541992133804" target="_blank" rel="noreferrer">
            +55 41 99213-3804
          </a>
        </div>
      </section>
    </LegalDocument>
  );
}
