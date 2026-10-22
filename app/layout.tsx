import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "../components/cart-provider";
import { jsonLd, organizationSchema, siteUrl } from "../lib/seo";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tiger Tech 3D | Impressoras 3D, filamentos e acessórios",
    template: "%s | Tiger Tech 3D",
  },
  description: "Impressoras 3D, filamentos e acessórios para makers, profissionais e empresas. Encontre a solução ideal para criar, prototipar e produzir.",
  applicationName: "Tiger Tech 3D",
  keywords: ["impressora 3D", "filamento 3D", "filamento PLA", "filamento PETG", "acessórios para impressora 3D", "Bambu Lab", "Snapmaker"],
  authors: [{ name: "Tiger Tech 3D" }],
  creator: "Tiger Tech 3D",
  publisher: "Tiger Tech 3D",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Tiger Tech 3D",
    title: "Tiger Tech 3D | Impressoras 3D, filamentos e acessórios",
    description: "Tecnologia para criar: impressoras 3D, filamentos e acessórios selecionados.",
    url: "/",
    images: [{ url: "/tiger-tech-logo.png", alt: "Tiger Tech 3D" }],
  },
  twitter: { card: "summary", title: "Tiger Tech 3D", description: "Impressoras 3D, filamentos e acessórios selecionados." },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem("tiger-theme")==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}` }} />
        <link rel="stylesheet" href="/tiger-global.css?v=20261022-1" />
        <link rel="stylesheet" href="/admin-product-visibility.css?v=20261002-1" />
        <link rel="stylesheet" href="/tiger-theme.css?v=20261022-1" />
      </head>
      <body className={`${manrope.variable} ${sora.variable}`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K4R8JS2N"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
        <CartProvider>{children}</CartProvider>
        <Analytics />
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K4R8JS2N');`}
        </Script>
      </body>
    </html>
  );
}
