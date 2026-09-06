import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../components/cart-provider";
import { absoluteUrl, siteUrl } from "../lib/seo";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Tiger Tech 3D",
  title: "Tiger Tech 3D | Impressoras 3D, filamentos e acessórios",
  description:
    "Impressoras 3D, filamentos e acessórios selecionados, com suporte especializado e envio para todo o Brasil.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Tiger Tech 3D",
    title: "Tiger Tech 3D | Tecnologia para criar",
    description:
      "Impressoras 3D, filamentos e acessórios selecionados, com suporte especializado e envio para todo o Brasil.",
  },
  twitter: {
    card: "summary",
    title: "Tiger Tech 3D | Tecnologia para criar",
    description:
      "Impressoras 3D, filamentos e acessórios selecionados, com suporte especializado.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${sora.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Tiger Tech 3D",
              legalName: "ECOMPLEX BRASIL COMÉRCIO ONLINE LTDA.",
              taxID: "54.570.656/0001-79",
              url: siteUrl,
              logo: absoluteUrl("/tiger-tech-logo-small.svg"),
              email: "contato.tigertechoficial@gmail.com",
              telephone: "+55 41 99213-3804",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+55 41 99213-3804",
                contactType: "sales",
                areaServed: "BR",
                availableLanguage: "Portuguese",
              },
            }).replace(/</g, "\\u003c"),
          }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
