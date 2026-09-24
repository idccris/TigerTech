import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
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
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="/tiger-global.css?v=20260912-2" />
      </head>
      <body className={`${manrope.variable} ${sora.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
