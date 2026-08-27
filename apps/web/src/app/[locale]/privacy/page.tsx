import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: `${t("title")} — GestandoApp` };
}

type Category = { title: string; items: string[] };

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("privacy");

  const dataCategories = t.raw("dataCollected.categories") as Category[];
  const purposeItems = t.raw("purpose.items") as string[];
  const sharingBody = t.raw("sharing.body") as string[];
  const controllerBody = t.raw("controller.body") as string[];
  const rightsItems = t.raw("rights.items") as string[];
  const usHealthCategories = t.raw("usHealthData.categories") as string[];
  const usHealthThirdParties = t.raw("usHealthData.thirdParties") as string[];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm font-semibold text-primary-dark hover:opacity-80">
        ← {t("backLink")}
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("lastUpdated")}</p>

      <p className="mt-8 text-lg text-muted">{t("intro")}</p>

      <div className="mt-6 rounded-2xl bg-iceblue px-5 py-4 text-sm text-iceblue-text">
        <h2 className="font-extrabold">{t("applicableLaw.heading")}</h2>
        <p className="mt-2">{t("applicableLaw.body")}</p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("controller.heading")}</h2>
        {controllerBody.map((p) => (
          <p key={p} className="mt-3 text-muted">
            {p}
          </p>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("dataCollected.heading")}</h2>
        <p className="mt-3 text-muted">{t("dataCollected.intro")}</p>
        <div className="mt-4 flex flex-col gap-4">
          {dataCategories.map((category) => (
            <div key={category.title} className="rounded-2xl bg-surface p-5 shadow-sm">
              <h3 className="font-extrabold text-ink">{category.title}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                {category.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 font-semibold text-ink">{t("dataCollected.note")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("purpose.heading")}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
          {purposeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-muted">{t("purpose.legalBasis")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("sharing.heading")}</h2>
        {sharingBody.map((p) => (
          <p key={p} className="mt-3 text-muted">
            {p}
          </p>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("retention.heading")}</h2>
        <p className="mt-3 text-muted">{t("retention.body")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("rights.heading")}</h2>
        <p className="mt-3 text-muted">{t("rights.intro")}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
          {rightsItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted italic">{t("rights.note")}</p>
        <p className="mt-4 text-muted">{t("rights.how")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("security.heading")}</h2>
        <p className="mt-3 text-muted">{t("security.body")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("children.heading")}</h2>
        <p className="mt-3 text-muted">{t("children.body")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("usHealthData.heading")}</h2>
        <p className="mt-3 text-muted">{t("usHealthData.intro")}</p>

        <h3 className="mt-6 font-extrabold text-ink">{t("usHealthData.categoriesHeading")}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {usHealthCategories.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="mt-6 font-extrabold text-ink">{t("usHealthData.sourcesHeading")}</h3>
        <p className="mt-2 text-muted">{t("usHealthData.sources")}</p>

        <h3 className="mt-6 font-extrabold text-ink">{t("usHealthData.purposesHeading")}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {purposeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="mt-6 font-extrabold text-ink">{t("usHealthData.sharingHeading")}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {usHealthThirdParties.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 font-semibold text-ink">{t("usHealthData.noSaleNoAds")}</p>

        <h3 className="mt-6 font-extrabold text-ink">{t("usHealthData.consentHeading")}</h3>
        <p className="mt-2 text-muted">{t("usHealthData.consentCollection")}</p>
        <p className="mt-2 text-muted">{t("usHealthData.consentSharing")}</p>

        <p className="mt-6 text-muted">{t("usHealthData.noGeofencing")}</p>
        <p className="mt-3 text-muted">{t("usHealthData.deletionRights")}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-ink">{t("changes.heading")}</h2>
        <p className="mt-3 text-muted">{t("changes.body")}</p>
      </section>
    </div>
  );
}
