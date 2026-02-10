"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../providers";
import {
  createMembershipType,
  deleteMembershipType,
  fetchMembershipTypes,
  updateMembershipType,
} from "../../services/membership-types";
import { MembershipTypeRecord } from "../../lib/membership-types";

const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_KEY_PLACEHOLDER = "Not available in client build";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const [theme, setTheme] = useState<"dark" | "dim">("dark");
  const [anonKeyVisible, setAnonKeyVisible] = useState(false);
  const [serviceKeyVisible, setServiceKeyVisible] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState<MembershipTypeRecord[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [membershipForm, setMembershipForm] = useState<{
    id?: string;
    name: string;
    price_monthly: string;
    is_active: boolean;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MembershipTypeRecord | null>(null);
  const [savingMembership, setSavingMembership] = useState(false);

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

  useEffect(() => {
    const loadMembershipTypes = async () => {
      try {
        setMembershipLoading(true);
        const data = await fetchMembershipTypes();
        setMembershipTypes(data);
      } catch (error) {
        setMembershipError(
          error instanceof Error ? error.message : "Failed to load membership types",
        );
      } finally {
        setMembershipLoading(false);
      }
    };
    loadMembershipTypes();
  }, []);

  const membershipHint = useMemo(() => {
    if (!membershipTypes.length) return t("membershipTypesEmpty");
    return t("membershipTypesHint");
  }, [membershipTypes.length, t]);

  const startMembershipForm = (type?: MembershipTypeRecord) => {
    if (type) {
      setMembershipForm({
        id: type.id,
        name: type.name,
        price_monthly: type.price_monthly != null ? type.price_monthly.toString() : "",
        is_active: type.is_active,
      });
      return;
    }
    setMembershipForm({
      name: "",
      price_monthly: "",
      is_active: true,
    });
  };

  const saveMembershipType = async () => {
    if (!membershipForm) return;
    if (!membershipForm.name.trim()) {
      setMembershipError(t("membershipNameRequired"));
      return;
    }
    try {
      setSavingMembership(true);
      setMembershipError(null);
      const priceValue = membershipForm.price_monthly.trim();
      const parsedPrice = priceValue ? Number(priceValue) : null;
      const payload = {
        name: membershipForm.name.trim(),
        price_monthly: parsedPrice != null && !Number.isNaN(parsedPrice) ? parsedPrice : null,
        is_active: membershipForm.is_active,
      };
      if (membershipForm.id) {
        const updated = await updateMembershipType(membershipForm.id, payload);
        setMembershipTypes((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await createMembershipType(payload);
        setMembershipTypes((prev) => [created, ...prev]);
      }
      setMembershipForm(null);
    } catch (error) {
      setMembershipError(
        error instanceof Error ? error.message : "Failed to save membership type",
      );
    } finally {
      setSavingMembership(false);
    }
  };

  const confirmDeleteMembership = async () => {
    if (!deleteTarget) return;
    try {
      setMembershipError(null);
      await deleteMembershipType(deleteTarget.id);
      setMembershipTypes((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (membershipForm?.id === deleteTarget.id) setMembershipForm(null);
      setDeleteTarget(null);
    } catch (error) {
      setMembershipError(
        error instanceof Error ? error.message : "Failed to delete membership type",
      );
    }
  };

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

            <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t("membershipTypes")}</p>
                  <p className="text-xs text-slate-400">{t("membershipTypesSubtitle")}</p>
                </div>
                <button
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
                  onClick={() => startMembershipForm()}
                >
                  {t("addMembershipType")}
                </button>
              </div>
              {membershipError && (
                <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {membershipError}
                </p>
              )}
              <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
                  <div className="grid grid-cols-4 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <span>{t("membershipTypeName")}</span>
                    <span>{t("membershipTypePrice")}</span>
                    <span>{t("membershipTypeStatus")}</span>
                    <span className="text-right">{t("membershipTypeActions")}</span>
                  </div>
                  <div className="divide-y divide-slate-800 text-sm text-slate-100">
                    {membershipLoading ? (
                      <div className="px-4 py-4 text-sm text-slate-400">
                        {t("membershipTypesLoading")}
                      </div>
                    ) : (
                      <>
                        {membershipTypes.map((type) => (
                          <div
                            key={type.id}
                            className="grid grid-cols-4 items-center px-4 py-4"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{type.name}</span>
                              <span className="text-xs text-slate-400">
                                {t("membershipTypeId")} {type.id}
                              </span>
                            </div>
                            <span className="text-slate-300">
                              {type.price_monthly != null
                                ? `$${type.price_monthly.toFixed(2)}`
                                : "—"}
                            </span>
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                type.is_active
                                  ? "bg-emerald-500/20 text-emerald-100"
                                  : "bg-slate-700/60 text-slate-200"
                              }`}
                            >
                              {type.is_active ? t("active") : t("inactive")}
                            </span>
                            <div className="flex justify-end gap-2">
                              <button
                                className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-emerald-500/20"
                                onClick={() => startMembershipForm(type)}
                              >
                                {t("edit")}
                              </button>
                              <button
                                className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                                onClick={() => setDeleteTarget(type)}
                              >
                                {t("delete")}
                              </button>
                            </div>
                          </div>
                        ))}
                        {membershipTypes.length === 0 && (
                          <div className="px-4 py-6 text-sm text-slate-400">
                            {membershipHint}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">
                      {membershipForm?.id ? t("editMembershipType") : t("newMembershipType")}
                    </p>
                    {membershipForm && (
                      <button
                        className="text-xs text-slate-400 underline"
                        onClick={() => setMembershipForm(null)}
                      >
                        {t("cancel")}
                      </button>
                    )}
                  </div>
                  {membershipForm ? (
                    <div className="mt-4 space-y-3 text-sm text-slate-100">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">{t("membershipTypeName")}</label>
                        <input
                          value={membershipForm.name}
                          onChange={(event) =>
                            setMembershipForm((prev) =>
                              prev ? { ...prev, name: event.target.value } : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                          placeholder={t("membershipTypeNamePlaceholder")}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">{t("membershipTypePrice")}</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={membershipForm.price_monthly}
                          onChange={(event) =>
                            setMembershipForm((prev) =>
                              prev ? { ...prev, price_monthly: event.target.value } : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                          placeholder={t("membershipTypePricePlaceholder")}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t("membershipTypeStatus")}
                          </p>
                          <p className="text-xs text-slate-400">
                            {t("membershipTypeStatusHint")}
                          </p>
                        </div>
                        <button
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            membershipForm.is_active
                              ? "bg-emerald-500/20 text-emerald-100"
                              : "bg-slate-800 text-slate-200"
                          }`}
                          onClick={() =>
                            setMembershipForm((prev) =>
                              prev ? { ...prev, is_active: !prev.is_active } : prev,
                            )
                          }
                        >
                          {membershipForm.is_active ? t("active") : t("inactive")}
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400">{t("ownerOnlySetting")}</span>
                        <button
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
                          onClick={saveMembershipType}
                          disabled={savingMembership}
                        >
                          {savingMembership ? t("saving") : t("saveMembershipType")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2 text-sm text-slate-400">
                      <p>{membershipHint}</p>
                      <p className="text-xs text-slate-500">{t("membershipTypeUniqueHint")}</p>
                    </div>
                  )}
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
          {deleteTarget && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-xl">
                <h3 className="text-lg font-semibold text-white">
                  {t("deleteMembershipTypeTitle")}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {t("deleteMembershipTypeBody")}{" "}
                  <span className="font-semibold text-white">{deleteTarget.name}</span>.
                </p>
                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                    onClick={() => setDeleteTarget(null)}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/40"
                    onClick={confirmDeleteMembership}
                  >
                    {t("confirmDelete")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
