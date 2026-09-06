import type { Metadata } from "next";
import LegalDocument from "../../components/legal-document";

export const metadata: Metadata = {
  title: "Trocas e Devoluções | Tiger Tech 3D",
  description:
    "Consulte os prazos, condições e procedimentos para trocas, devoluções e reembolsos.",
  alternates: { canonical: "/trocas-e-devolucoes" },
};

const index = [
  "Como solicitar",
  "Prazo e condições",
  "Procedimento de envio",
  "Análise",
  "Reembolso",
  "Observações",
];

export default function ReturnsPage() {
  return (
    <LegalDocument
      kicker="ATENDIMENTO PÓS-COMPRA"
      title="Trocas e Devoluções"
      lead={
        <>
          Consulte os procedimentos para solicitar troca, devolução ou exercer
          o direito de arrependimento com <strong>clareza e segurança</strong>.
        </>
      }
      index={index}
    >
      <section>
        <span>01</span>
        <h2>Solicitação de troca ou devolução</h2>
        <p>
          Toda solicitação deve ser realizada através do nosso atendimento,
          disponível via <strong>site ou WhatsApp</strong>. Nossa equipe
          orientará você durante todas as etapas do processo.
        </p>
      </section>

      <section>
        <span>02</span>
        <h2>Condições para troca, devolução ou arrependimento</h2>
        <p>
          Nas compras realizadas fora do estabelecimento comercial, você poderá
          exercer o direito de arrependimento em até <strong>7 dias corridos</strong>
          contados do recebimento do produto, nos termos do Código de Defesa do
          Consumidor.
        </p>
        <p>Para agilizar a análise e proteger o produto durante o transporte:</p>
        <ul>
          <li>Não utilize o produto além do necessário para sua verificação</li>
          <li>Conserve e utilize a embalagem original sempre que possível</li>
          <li>Envie todos os acessórios, manuais e itens recebidos</li>
          <li>Proteja adequadamente o produto contra danos no transporte</li>
        </ul>
        <div className="legal-note">
          A abertura da embalagem, isoladamente, não elimina o direito de
          arrependimento. Sinais de uso indevido, avarias provocadas pelo cliente
          ou ausência de componentes serão avaliados conforme a legislação.
        </div>
      </section>

      <section>
        <span>03</span>
        <h2>Como funciona o envio</h2>
        <p>
          Após a solicitação dentro do prazo, nossa equipe informará o
          procedimento de envio, que poderá variar conforme o tipo, tamanho e
          quantidade do produto.
        </p>
        <p>
          Nos casos de <strong>arrependimento dentro do prazo legal</strong>, os
          custos necessários para a devolução serão suportados pela Tiger Tech
          3D. Assim que o produto retornar, será realizada uma análise técnica.
        </p>
      </section>

      <section>
        <span>04</span>
        <h2>Análise e aprovação</h2>
        <p>Após o recebimento em nosso centro logístico:</p>
        <ul>
          <li>
            Se o produto estiver de acordo com as condições legais e aplicáveis,
            a troca ou devolução será aprovada.
          </li>
          <li>
            Se forem identificados danos provocados, mau uso ou ausência de
            itens, entraremos em contato para informar o resultado da análise e
            as providências cabíveis.
          </li>
        </ul>
      </section>

      <section>
        <span>05</span>
        <h2>Reembolso</h2>
        <h3>Cartão de crédito</h3>
        <p>
          Após a aprovação, o estorno será solicitado à administradora do
          cartão. O prazo de processamento depende da operadora e poderá ser
          refletido em faturas subsequentes.
        </p>
        <h3>Pix, boleto ou transferência</h3>
        <p>
          O reembolso será realizado após a aprovação da devolução, por meio de
          transferência para conta indicada pelo cliente. Os dados bancários
          serão solicitados durante o atendimento.
        </p>
      </section>

      <section>
        <span>06</span>
        <h2>Observações importantes</h2>
        <ul>
          <li>
            Equipamentos adquiridos via atendimento personalizado poderão ter
            procedimentos logísticos específicos, sem prejuízo dos direitos
            legais do consumidor.
          </li>
          <li>
            Em caso de defeito, o atendimento poderá seguir também as regras de
            garantia legal e do fabricante.
          </li>
        </ul>
      </section>
    </LegalDocument>
  );
}
