import Link from "next/link";
import BrandLogo from "./brand-logo";

const whatsapp = "https://wa.me/5541992133804";

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
            <span aria-label="Instagram">◎</span>
            <span aria-label="Facebook">f</span>
            <a href={whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">◉</a>
          </div>
        </section>

        <section className="footer-links">
          <span className="footer-label">INSTITUCIONAL</span>
          <nav aria-label="Links institucionais">
            <Link href="/impressoras-3d">Impressoras 3D</Link>
            <Link href="/filamentos">Filamentos 3D</Link>
            <Link href="/acessorios-impressora-3d">Acessórios</Link>
            <Link href="/sobre">Sobre a empresa</Link>
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
            <span className="payment-card visa" aria-label="Visa">VISA</span>
            <span className="payment-card mastercard" aria-label="Mastercard"><i /><i /><b>mastercard</b></span>
            <span className="payment-card diners" aria-label="Diners Club"><i>D</i><b>DINERS CLUB<br />INTERNATIONAL</b></span>
            <span className="payment-card amex" aria-label="American Express"><b>AMERICAN<br />EXPRESS</b></span>
            <span className="payment-card elo" aria-label="Elo"><i />elo</span>
            <span className="payment-card boleto" aria-label="Boleto"><i /><b>Boleto</b></span>
            <span className="payment-card bradesco" aria-label="Bradesco"><i>◉</i>bradesco</span>
            <span className="payment-card banco-do-brasil" aria-label="Banco do Brasil"><i>◇</i></span>
            <span className="payment-card pix" aria-label="Pix"><i>◇</i>pix</span>
          </div>
          <span className="footer-label security-title">SEGURANÇA</span>
          <div className="security-badges">
            <span><i>✓</i><b>Ambiente protegido</b></span>
            <span><i>◆</i><b>Compra segura</b></span>
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
