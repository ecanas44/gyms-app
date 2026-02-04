"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "../providers";

const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_KEY_PLACEHOLDER = "Not available in client build";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const [theme, setTheme] = useState<"dark" | "dim">("dark");
  const [anonKeyVisible, setAnonKeyVisible] = useState(false);
  const [serviceKeyVisible, setServiceKeyVisible] = useState(false);

  const supabaseUrl = PUBLIC_SUPABASE_URL || "Not set";
  const supabaseAnon = PUBLIC_SUPABASE_ANON_KEY || "Not set";
  const supabaseService = SERVICE_KEY_PLACEHOLDER;

  const displayKey = (key: string, visible: boolean) =>
    visible ? key : key === "Not set" ? key : key.slice(0, 4) + "••••••••" + key.slice(-4);

  const drawerLinks: { label: string; href?: string }[] = [
    { label: t("overview"), href: "/" },
    { label: t("waivers"), href: "/waivers" },
    { label: t("members"), href: "/members" },
    { label: t("checkins"), href: "/checkins" },
    { label: t("settings"), href: "/settings" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      <div className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden pointer-events-none opacity-0" />

      <aside className="fixed inset-y-0 left-0 z-40 w-72 max-w-full bg-slate-950/80 px-6 py-8 backdrop-blur-xl lg:translate-x-0">
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Gyms CRM
          </div>
        </div>
        <div className="mt-8 space-y-1">
          {drawerLinks.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition hover:bg-slate-800/80 ${
                  item.href === "/settings" ? "text-white" : "text-slate-200"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">›</span>
              </Link>
            ) : null,
          )}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-20 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("settings")}</p>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">{t("workspaceSettings")}</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-16 pt-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t("supabaseConnection")}</p>
                  <p className="text-xs text-slate-400">{t("projectCredentials")}</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                  Read-only
                </span>
              </div>
              <div className="space-y-3 text-sm text-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">{t("url")}</p>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-mono text-slate-200">
                    {supabaseUrl}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">{t("anonKey")}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-mono text-slate-200">
                      {displayKey(supabaseAnon, anonKeyVisible)}
                    </div>
                    <button
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-700"
                      onClick={() => setAnonKeyVisible((v) => !v)}
                    >
                      {anonKeyVisible ? t("hide") : t("show")}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">{t("serviceRoleKey")}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-mono text-slate-200">
                      {displayKey(supabaseService, serviceKeyVisible)}
                    </div>
                    <button
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-700"
                      onClick={() => setServiceKeyVisible((v) => !v)}
                    >
                      {serviceKeyVisible ? t("hide") : t("show")}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t("appearance")}</p>
                  <p className="text-xs text-slate-400">{t("themePref")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {(["dark", "dim"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      theme === value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                        : "border-slate-800 bg-slate-900/60 text-slate-200"
                    }`}
                  >
                    {value === "dark" ? "Dark" : "Dim"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                (Theme toggle is local only; hook into app-wide theme when ready.)
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t("dataTools")}</p>
                  <p className="text-xs text-slate-400">{t("localDevHelpers")}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-100">
                <p className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-200">
                  Use the CLI for database actions:
                  <br />
                  <code className="text-emerald-200">supabase db reset --local --yes</code>
                  <br />
                  <code className="text-emerald-200">supabase db push</code>
                </p>
                <p className="text-xs text-slate-400">
                  (These commands are informational only; run them in your terminal.)
                </p>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t("language")}</p>
                  <p className="text-xs text-slate-400">{t("themePref")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLang("en")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    lang === "en"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-200"
                  }`}
                >
                  {t("english")}
                </button>
                <button
                  onClick={() => setLang("es")}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    lang === "es"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-200"
                  }`}
                >
                  {t("spanish")}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
