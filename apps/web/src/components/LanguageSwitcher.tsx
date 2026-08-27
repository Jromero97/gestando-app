"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("language");

  return (
    <div className="flex items-center rounded-full border border-black/10 bg-surface p-1 text-sm font-semibold">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-3 py-1 transition ${
            l === locale ? "bg-ink text-white" : "text-muted hover:text-ink"
          }`}
        >
          {l.toUpperCase()}
          <span className="sr-only"> — {t(l)}</span>
        </Link>
      ))}
    </div>
  );
}
