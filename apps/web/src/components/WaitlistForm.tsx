"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm({ className = "" }: { className?: string }) {
  const t = useTranslations("waitlist");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch(`${API_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className={`rounded-2xl bg-surface px-5 py-4 text-center font-semibold text-ink shadow-sm ${className}`}
      >
        {t("success")}
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          {t("emailLabel")}
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          placeholder={t("placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-surface px-5 py-3.5 text-base text-ink placeholder:text-muted focus:border-primary-dark focus:outline-2 focus:outline-primary-dark focus:outline-offset-2 sm:flex-1"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-2xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
      </form>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-500">
          {t("error")}
        </p>
      )}
    </div>
  );
}
