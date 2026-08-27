import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const siteUrl = "https://gestandoapp.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        es: "/",
        en: "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: locale === "en" ? `${siteUrl}/en` : siteUrl,
      siteName: "GestandoApp",
      locale: locale === "en" ? "en_US" : "es_CL",
      type: "website",
      images: [{ url: "/og-image-source.png", width: 1024, height: 1024 }],
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("twitterDescription"),
      images: ["/og-image-source.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fbf0ef",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
