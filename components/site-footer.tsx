import Link from "next/link";
import BrandLogo from "./brand-logo";
import { Facebook, Instagram, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";

const whatsapp = "https://wa.me/5541992133804";

type VectorPaymentName = "visa" | "diners" | "amex" | "bradesco" | "pix";

const paymentVectors: Record<VectorPaymentName, { fill: string; viewBox: string; path: string }> = {
  visa: {
    fill: "#1A1F71",
    viewBox: "0 0 24 24",
    path: "M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z",
  },
  diners: {
    fill: "#004C97",
    viewBox: "0 0 24 24",
    path: "M16.506 11.982a6.026 6.026 0 0 0-3.866-5.618V17.6a6.025 6.025 0 0 0 3.866-5.618zM8.33 17.598V6.365a6.03 6.03 0 0 0-3.863 5.617 6.028 6.028 0 0 0 3.863 5.616zm2.156-15.113A9.497 9.497 0 0 0 .99 11.982a9.495 9.495 0 0 0 9.495 9.494c5.245 0 9.495-4.25 9.496-9.494a9.499 9.499 0 0 0-9.496-9.497Zm-.023 19.888C4.723 22.4 0 17.75 0 12.09 0 5.905 4.723 1.626 10.463 1.627h2.69C18.822 1.627 24 5.903 24 12.09c0 5.658-5.176 10.283-10.848 10.283",
  },
  amex: {
    fill: "#2E77BC",
    viewBox: "0 0 24 24",
    path: "M16.015 14.378c0-.32-.135-.496-.344-.622-.21-.12-.464-.135-.81-.135h-1.543v2.82h.675v-1.027h.72c.24 0 .39.024.478.125.12.13.104.38.104.55v.35h.66v-.555c-.002-.25-.017-.376-.108-.516-.06-.08-.18-.18-.33-.234l.02-.008c.18-.072.48-.297.48-.747zm-.87.407l-.028-.002c-.09.053-.195.058-.33.058h-.81v-.63h.824c.12 0 .24 0 .33.05.098.048.156.147.15.255 0 .12-.045.215-.134.27zM20.297 15.837H19v.6h1.304c.676 0 1.05-.278 1.05-.884 0-.28-.066-.448-.187-.582-.153-.133-.392-.193-.73-.207l-.376-.015c-.104 0-.18 0-.255-.03-.09-.03-.15-.105-.15-.21 0-.09.017-.166.09-.21.083-.046.177-.066.272-.06h1.23v-.602h-1.35c-.704 0-.958.437-.958.84 0 .9.776.855 1.407.87.104 0 .18.015.225.06.046.03.082.106.082.18 0 .077-.035.15-.08.18-.06.053-.15.07-.277.07zM0 0v10.096L.81 8.22h1.75l.225.464V8.22h2.043l.45 1.02.437-1.013h6.502c.295 0 .56.057.756.236v-.23h1.787v.23c.307-.17.686-.23 1.12-.23h2.606l.24.466v-.466h1.918l.254.465v-.466h1.858v3.948H20.87l-.36-.6v.585h-2.353l-.256-.63h-.583l-.27.614h-1.213c-.48 0-.84-.104-1.08-.24v.24h-2.89v-.884c0-.12-.03-.12-.105-.135h-.105v1.036H6.067v-.48l-.21.48H4.69l-.202-.48v.465H2.235l-.256-.624H1.4l-.256.624H0V24h23.786v-7.108c-.27.135-.613.18-.973.18H21.09v-.255c-.21.165-.57.255-.914.255H14.71v-.9c0-.12-.018-.12-.12-.12h-.075v1.022h-1.8v-1.066c-.298.136-.643.15-.928.136h-.214v.915h-2.18l-.54-.617-.57.6H4.742v-3.93h3.61l.518.602.554-.6h2.412c.28 0 .74.03.942.225v-.24h2.177c.202 0 .644.045.903.225v-.24h3.265v.24c.163-.164.508-.24.803-.24h1.89v.24c.194-.15.464-.24.84-.24h1.176V0H0zM21.156 14.955c.004.005.006.012.01.016.01.01.024.01.032.02l-.042-.035zM23.828 13.082h.065v.555h-.065zM23.865 15.03v-.005c-.03-.025-.046-.048-.075-.07-.15-.153-.39-.215-.764-.225l-.36-.012c-.12 0-.194-.007-.27-.03-.09-.03-.15-.105-.15-.21 0-.09.03-.16.09-.204.076-.045.15-.05.27-.05h1.223v-.588h-1.283c-.69 0-.96.437-.96.84 0 .9.78.855 1.41.87.104 0 .18.015.224.06.046.03.076.106.076.18 0 .07-.034.138-.09.18-.045.056-.136.07-.27.07h-1.288v.605h1.287c.42 0 .734-.118.9-.36h.03c.09-.134.135-.3.135-.523 0-.24-.045-.39-.135-.526zM18.597 14.208v-.583h-2.235V16.458h2.235v-.585h-1.57v-.57h1.533v-.584h-1.532v-.51M13.51 8.787h.685V11.6h-.684zM13.126 9.543l-.007.006c0-.314-.13-.5-.34-.624-.217-.125-.47-.135-.81-.135H10.43v2.82h.674v-1.034h.72c.24 0 .39.03.487.12.122.136.107.378.107.548v.354h.677v-.553c0-.25-.016-.375-.11-.516-.09-.107-.202-.19-.33-.237.172-.07.472-.3.472-.75zm-.855.396h-.015c-.09.054-.195.056-.33.056H11.1v-.623h.825c.12 0 .24.004.33.05.09.04.15.128.15.25s-.047.22-.134.266zM15.92 9.373h.632v-.6h-.644c-.464 0-.804.105-1.02.33-.286.3-.362.69-.362 1.11 0 .512.123.833.36 1.074.232.238.645.31.97.31h.78l.255-.627h1.39l.262.627h1.36v-2.11l1.272 2.11h.95l.002.002V8.786h-.684v1.963l-1.18-1.96h-1.02V11.4L18.11 8.744h-1.004l-.943 2.22h-.3c-.177 0-.362-.03-.468-.134-.125-.15-.186-.36-.186-.662 0-.285.08-.51.194-.63.133-.135.272-.165.516-.165zm1.668-.108l.464 1.118v.002h-.93l.466-1.12zM2.38 10.97l.254.628H4V9.393l.972 2.205h.584l.973-2.202.015 2.202h.69v-2.81H6.118l-.807 1.904-.876-1.905H3.343v2.663L2.205 8.787h-.997L.01 11.597h.72l.26-.626h1.39zm-.688-1.705l.46 1.118-.003.002h-.915l.457-1.12zM11.856 13.62H9.714l-.85.923-.825-.922H5.346v2.82H8l.855-.932.824.93h1.302v-.94h.838c.6 0 1.17-.164 1.17-.945l-.006-.003c0-.78-.598-.93-1.128-.93zM7.67 15.853l-.014-.002H6.02v-.557h1.47v-.574H6.02v-.51H7.7l.733.82-.764.824zm2.642.33l-1.03-1.147 1.03-1.108v2.253zm1.553-1.258h-.885v-.717h.885c.24 0 .42.098.42.344 0 .243-.15.372-.42.372zM9.967 9.373v-.586H7.73V11.6h2.237v-.58H8.4v-.564h1.527V9.88H8.4v-.507",
  },
  bradesco: {
    fill: "#E5173F",
    viewBox: "0 0 123 23.1",
    path: "M34.6,9.8a6.2,6.2,0,0,0-2.6.6V4.1a11.8,11.8,0,0,0-2.9,1.6A1.6,1.6,0,0,0,28.5,7V22.4a13.9,13.9,0,0,0,4.6.7c4.6,0,7.2-2.8,7.2-6.8S38.5,9.8,34.6,9.8ZM33.3,20.3a3.2,3.2,0,0,1-1.3-.2v-7a5.4,5.4,0,0,1,2-.4c1.8,0,2.7,1.2,2.7,3.5S35.6,20.3,33.3,20.3ZM11.6,16.4l-1.4.8c-.2.1-.2.2-.2.4v5.1c0,.2.1.3.2.3h1.4V16.4ZM49.2,9.9a4.2,4.2,0,0,0-3.5,1.8,12.4,12.4,0,0,0-.4-1.6l-1.4-.2-1.4.2V22.8a4.4,4.4,0,0,0,1.7.2l1.8-.2V16.6c0-2.5,1.3-3.8,3-3.8h1.2a8.8,8.8,0,0,0,0-2.8Zm-35,5-1.8,1h-.1v6.9h2a.4.4,0,0,0,.4-.4V15.2A.3.3,0,0,0,14.2,14.9Zm-2.8-10A22.5,22.5,0,0,0,7,5.3a8.2,8.2,0,0,1,6.6-3.2A9,9,0,0,1,19,3.9c.2.2.4.3.6.1a.4.4,0,0,0,0-.6A9.3,9.3,0,0,0,12.2,0,9.5,9.5,0,0,0,3.5,6.1L.3,7.4q-.4.3-.3.6a.4.4,0,0,0,.6.2,18.3,18.3,0,0,1,2.5-.6A6.1,6.1,0,0,0,3,9a9.3,9.3,0,0,0,4.3,8c.2.1.5.1.6-.1s.1-.4-.1-.6a7.9,7.9,0,0,1-2.6-6,6.4,6.4,0,0,1,.7-3.1L8.7,7c6.8,0,12.6,2.3,12.6,5.2s-1.9,3-4.2,4c-.5.2-.5.4-.5.6s.3.3.6.2c4-1.2,6.9-3.4,6.9-5.9S18.5,4.9,11.4,4.9ZM71.3,7v3l-1.8-.2c-3.9,0-6.5,2.6-6.5,6.8s2.5,6.5,6.5,6.5a15.1,15.1,0,0,0,5.3-.8V4.1a11.8,11.8,0,0,0-2.9,1.6A1.4,1.4,0,0,0,71.3,7Zm0,13.1a4.1,4.1,0,0,1-1.5.2c-2.3,0-3.2-1.5-3.2-3.7s.9-4,3.2-4l1.5.2Zm35.8.2c-1.7,0-2.9-1.4-2.9-3.8s1-3.8,2.9-3.8a5.9,5.9,0,0,1,2.3.4,6,6,0,0,1,1.2-2.4,7.5,7.5,0,0,0-3.9-.9c-3.9,0-6.1,2.7-6.1,6.7s2.3,6.6,6.2,6.6a8,8,0,0,0,3.9-.8,9.7,9.7,0,0,1-1.4-2.5A4.7,4.7,0,0,1,107.1,20.3ZM55.7,9.8a15.3,15.3,0,0,0-3.8.4,6.6,6.6,0,0,0,0,2.8,10.6,10.6,0,0,1,3.2-.4c1.8,0,2.7.7,2.7,2.2V15l-1.7-.2c-2.9,0-5.5,1.1-5.5,4s2.3,4.3,5.7,4.3a19.9,19.9,0,0,0,4.8-.7V15.1C61.1,11.6,59.2,9.9,55.7,9.8Zm2.1,10.5H56.3c-1.6,0-2.5-.5-2.5-1.6s.9-1.6,2.5-1.6h1.5ZM116.9,9.8c-3.9,0-6.1,2.7-6.1,6.7s2.3,6.6,6.1,6.6,6.1-2.6,6.1-6.6S120.8,9.8,116.9,9.8Zm0,10.5c-2,0-2.5-1.6-2.5-3.8s.5-3.9,2.5-3.9,2.6,1.6,2.6,3.9S118.8,20.3,116.9,20.3ZM82.8,9.8c-3.7,0-6,2.5-6,6.7s2.4,6.6,6.6,6.6a9.9,9.9,0,0,0,4-.7,6.2,6.2,0,0,0,0-2.7,11.8,11.8,0,0,1-3.6.6c-2,0-3.3-.8-3.6-2.8h7.9a9.9,9.9,0,0,0,.2-1.8C88.3,11.9,86.1,9.8,82.8,9.8Zm-2.6,5.1a2.5,2.5,0,0,1,2.6-2.4c1.6,0,2.2,1,2.2,2.4Zm16.1.4-1.5-.6c-.8-.4-1.2-.6-1.2-1.2s.7-1,1.6-1a11,11,0,0,1,3.3.6,5.7,5.7,0,0,0,0-2.6,8.3,8.3,0,0,0-3.8-.7C92,9.8,90,11.2,90,13.4s.8,3,3.2,4l1.1.4c1,.4,1.3.7,1.3,1.4s-1,1.1-1.8,1.1a9.9,9.9,0,0,1-3.8-.7,4.2,4.2,0,0,0,0,2.7,9.4,9.4,0,0,0,4.3.8c2.7,0,4.9-1.4,4.9-3.9S98.3,16.1,96.3,15.3Z",
  },
  pix: {
    fill: "#77B6A8",
    viewBox: "0 0 24 24",
    path: "M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156",
  },
};

function VectorPaymentLogo({ name }: { name: VectorPaymentName }) {
  const logo = paymentVectors[name];
  return (
    <svg viewBox={logo.viewBox} fill={logo.fill} aria-hidden="true" focusable="false">
      <path d={logo.path} />
    </svg>
  );
}


export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <section className="footer-company">
          <span className="footer-label">EMPRESA</span>
          <h3>ECOMPLEX BRASIL<br />COMÉRCIO ONLINE LTDA.</h3>
          <p>CNPJ 54.570.656/0001-79</p>
          <a href="tel:+5541992133804">+55 41 9 9213-3804</a>
          <a href="mailto:contato.tigertechoficial@gmail.com">contato.tigertechoficial@gmail.com</a>
        </section>

        <section className="footer-intro">
          <Link className="footer-logo" href="/" aria-label="Tiger Tech início">
            <BrandLogo size={46} />
            <strong>TIGER TECH <em>3D</em></strong>
          </Link>
          <p>Transforme projetos em realidade com impressão 3D, máquinas selecionadas e filamentos profissionais.</p>
          <div className="footer-social" aria-label="Redes sociais">
            <span role="img" aria-label="Instagram"><Instagram aria-hidden="true" /></span>
            <span role="img" aria-label="Facebook"><Facebook aria-hidden="true" /></span>
            <a href={whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle aria-hidden="true" /></a>
          </div>
        </section>

        <section className="footer-links">
          <span className="footer-label">INSTITUCIONAL</span>
          <nav aria-label="Links institucionais">
            <Link href="/impressoras-3d">Impressoras 3D</Link>
            <Link href="/filamentos">Filamentos 3D</Link>
            <Link href="/acessorios-impressora-3d">Acessórios</Link>
            <Link href="/sobre">Sobre a empresa</Link>
            <Link href="/conteudos">Conteúdos</Link>
            <Link href="/produtos">Como comprar</Link>
            <Link href="/seguranca">Segurança</Link><Link href="/envio">Envio</Link><Link href="/pagamento">Pagamento</Link>
            <Link href="/garantia">Tempo de garantia</Link><Link href="/politica-de-privacidade">Política de privacidade</Link>
            <span>Termos de uso</span><Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>
            <a href={whatsapp} target="_blank" rel="noreferrer">Fale conosco</a>
            <Link href="/admin">Área administrativa</Link>
          </nav>
        </section>

        <section className="footer-trust">
          <span className="footer-label">FORMAS DE PAGAMENTO</span>
          <div className="payment-grid" aria-label="Cartões, boleto e Pix">
            <span className="payment-card vector-payment visa" role="img" aria-label="Visa"><VectorPaymentLogo name="visa" /></span>
            <span className="payment-card mastercard" aria-label="Mastercard"><i /><i /><b>mastercard</b></span>
            <span className="payment-card vector-payment diners" role="img" aria-label="Diners Club"><VectorPaymentLogo name="diners" /></span>
            <span className="payment-card vector-payment amex" role="img" aria-label="American Express"><VectorPaymentLogo name="amex" /></span>
            <span className="payment-card elo" aria-label="Elo"><i />elo</span>
            <span className="payment-card boleto" aria-label="Boleto"><i /><b>Boleto</b></span>
            <span className="payment-card vector-payment bradesco" role="img" aria-label="Bradesco"><VectorPaymentLogo name="bradesco" /></span>
            <span className="payment-card banco-do-brasil" aria-label="Banco do Brasil"><i>◇</i></span>
            <span className="payment-card vector-payment pix" role="img" aria-label="Pix"><VectorPaymentLogo name="pix" /></span>
          </div>
          <span className="footer-label security-title">SEGURANÇA</span>
          <div className="security-badges">
            <span><i><ShieldCheck aria-hidden="true" /></i><b>Ambiente protegido</b></span>
            <span><i><LockKeyhole aria-hidden="true" /></i><b>Compra segura</b></span>
          </div>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© 2026 TIGER TECH 3D</span>
        <p>Tecnologia que transforma ideias.</p>
        <span>Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
