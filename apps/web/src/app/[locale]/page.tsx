import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PhoneFrame } from "@/components/PhoneFrame";
import { WaitlistForm } from "@/components/WaitlistForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function Home() {
  const t = await getTranslations();
  const locale = await getLocale();

  const features = [
    {
      key: "progress",
      title: t("features.progress.title"),
      body: t("features.progress.body"),
      image: `/screenshots/progreso-${locale}.png`,
      tint: "bg-lavender",
    },
    {
      key: "agenda",
      title: t("features.agenda.title"),
      body: t("features.agenda.body"),
      image: `/screenshots/agenda-${locale}.png`,
      tint: "bg-iceblue",
    },
    {
      key: "diary",
      title: t("features.diary.title"),
      body: t("features.diary.body"),
      image: `/screenshots/diario-${locale}.png`,
      tint: "bg-rose",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image src="/logo-mark.png" alt="" width={36} height={36} className="rounded-xl" />
          <span className="font-extrabold text-lg tracking-tight text-ink">GestandoApp</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a
            href="#waitlist"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {t("nav.cta")}
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <p className="mb-4 inline-block rounded-full bg-rose px-4 py-1.5 text-sm font-semibold text-primary-dark">
              {t("hero.badge")}
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">{t("hero.subtitle")}</p>
            <div id="waitlist" className="mt-8 max-w-md scroll-mt-24">
              <WaitlistForm />
              <p className="mt-3 text-sm text-muted">{t("hero.formNote")}</p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[280px] md:max-w-[320px]">
            <div className="absolute inset-0 -z-10 rounded-[40px] bg-primary/20 blur-3xl" />
            <PhoneFrame>
              <Image
                src={`/screenshots/dashboard-${locale}.png`}
                alt={t("hero.imageAlt")}
                width={780}
                height={1688}
                priority
                className="w-full"
              />
            </PhoneFrame>
          </div>
        </section>

        {/* Features */}
        <section className="bg-surface py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {t("features.heading")}
            </h2>

            <div className="mt-16 flex flex-col gap-20">
              {features.map((feature, i) => (
                <div
                  key={feature.key}
                  className={`grid items-center gap-10 md:grid-cols-2 ${
                    i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative mx-auto w-full max-w-[240px] md:max-w-[260px]">
                    <div className={`absolute inset-6 -z-10 rounded-[40px] blur-2xl ${feature.tint}`} />
                    <PhoneFrame>
                      <Image src={feature.image} alt="" width={780} height={1688} className="w-full" />
                    </PhoneFrame>
                  </div>
                  <div className="mx-auto max-w-md text-center md:mx-0 md:text-left">
                    <h3 className="text-2xl font-extrabold tracking-tight text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-lg text-muted">{feature.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t("cta.heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted">{t("cta.subtitle")}</p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="" width={20} height={20} className="rounded-md" />
            <span className="font-semibold text-ink">GestandoApp</span>
          </div>
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4">
            <Link href="/privacy" className="hover:text-ink">
              {t("privacy.title")}
            </Link>
            <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
