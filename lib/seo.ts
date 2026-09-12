const fallbackSiteUrl = "https://catalogo-nova.vercel.app";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, `${siteUrl}/`).toString();
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tiger Tech 3D",
  legalName: "ECOMPLEX BRASIL COMÉRCIO ONLINE LTDA.",
  url: siteUrl,
  logo: absoluteUrl("/tiger-tech-logo.png"),
  email: "contato.tigertechoficial@gmail.com",
  telephone: "+55 41 99213-3804",
  taxID: "54.570.656/0001-79",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55 41 99213-3804",
    contactType: "customer service",
    availableLanguage: "Portuguese",
  },
};
