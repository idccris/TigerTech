import type { ReactNode } from "react";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

export default function LegalDocument({
  kicker,
  title,
  lead,
  index,
  children,
}: {
  kicker: string;
  title: string;
  lead: ReactNode;
  index: string[];
  children: ReactNode;
}) {
  return (
    <main className="legal-page">
      <SiteHeader solid />
      <section className="legal-hero">
        <div>
          <span className="section-kicker">{kicker}</span>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
        <aside>
          <span>CONTEÚDO</span>
          <ol>
            {index.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </aside>
      </section>
      <article className="legal-document">{children}</article>
      <SiteFooter />
    </main>
  );
}
