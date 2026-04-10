"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n, useTheme } from "../providers";
import {
  createMembershipType,
  deleteMembershipType,
  fetchMembershipTypes,
  updateMembershipType,
} from "../../services/membership-types";
import type { MembershipTypeRecord, PlanType } from "../../lib/membership-types";

const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

type MembershipDraft = {
  name: string;
  priceMonthly: string;
  planType: PlanType;
  isActive: boolean;
};

function toPriceValue(value: string, invalidPriceMessage: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(invalidPriceMessage);
  }
  return Number(parsed.toFixed(2));
}

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const [anonKeyVisible, setAnonKeyVisible] = useState(false);
  const [serviceKeyVisible, setServiceKeyVisible] = useState(false);

  const [ownerKey, setOwnerKey] = useState("");
  const [membershipTypes, setMembershipTypes] = useState<MembershipTypeRecord[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [membershipBusyId, setMembershipBusyId] = useState<string | null>(null);
  const [creatingMembership, setCreatingMembership] = useState(false);
  const [newType, setNewType] = useState<MembershipDraft>({
    name: "",
    priceMonthly: "",
    planType: "monthly",
    isActive: true,
  });
  const [drafts, setDrafts] = useState<Record<string, MembershipDraft>>({});

  useEffect(() => {
    const savedOwnerKey = window.localStorage.getItem("owner-settings-key");
    if (savedOwnerKey) setOwnerKey(savedOwnerKey);
  }, [t]);

  useEffect(() => {
    window.localStorage.setItem("owner-settings-key", ownerKey);
  }, [ownerKey]);

  const supabaseUrl = PUBLIC_SUPABASE_URL || t("notSet");
  const supabaseAnon = PUBLIC_SUPABASE_ANON_KEY || t("notSet");
  const supabaseService = t("notAvailableClient");

  const displayKey = (key: string, visible: boolean) =>
    visible ? key : key === t("notSet") ? key : key.slice(0, 4) + "••••••••" + key.slice(-4);

  const drawerLinks: { label: string; href?: string }[] = [
    { label: t("overview"), href: "/" },
    { label: t("waivers"), href: "/waivers" },
    { label: t("members"), href: "/members" },
    { label: t("checkins"), href: "/checkins" },
    { label: t("settings"), href: "/settings" },
  ];

  const syncDrafts = (items: MembershipTypeRecord[]) => {
    setDrafts(
      items.reduce<Record<string, MembershipDraft>>((acc, item) => {
        acc[item.id] = {
          name: item.name,
          priceMonthly: item.price_monthly == null ? "" : String(item.price_monthly),
          planType: item.plan_type ?? "custom",
          isActive: item.is_active,
        };
        return acc;
      }, {}),
    );
  };

  useEffect(() => {
    const loadMembershipTypes = async () => {
      try {
        setMembershipLoading(true);
        setMembershipError(null);
        const data = await fetchMembershipTypes();
        setMembershipTypes(data);
        syncDrafts(data);
      } catch (error) {
        setMembershipError(error instanceof Error ? error.message : t("failedLoadMembershipTypes"));
      } finally {
        setMembershipLoading(false);
      }
    };

    loadMembershipTypes();
  }, [t]);

  const createType = async () => {
    try {
      setCreatingMembership(true);
      setMembershipError(null);
      const created = await createMembershipType(
        {
          name: newType.name,
          price_monthly: toPriceValue(newType.priceMonthly, t("priceMustBeNonNegative")),
          plan_type: newType.planType,
          is_active: newType.isActive,
        },
        ownerKey.trim() || undefined,
      );
      const updated = [...membershipTypes, created].sort((a, b) => a.name.localeCompare(b.name));
      setMembershipTypes(updated);
      syncDrafts(updated);
      setNewType({ name: "", priceMonthly: "", planType: "monthly", isActive: true });
    } catch (error) {
      setMembershipError(error instanceof Error ? error.message : t("failedCreateMembershipType"));
    } finally {
      setCreatingMembership(false);
    }
  };

  const saveType = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    try {
      setMembershipBusyId(id);
      setMembershipError(null);
      const updatedItem = await updateMembershipType(
        id,
        {
          name: draft.name,
          price_monthly: toPriceValue(draft.priceMonthly, t("priceMustBeNonNegative")),
          plan_type: draft.planType,
          is_active: draft.isActive,
        },
        ownerKey.trim() || undefined,
      );
      const updated = membershipTypes.map((item) => (item.id === id ? updatedItem : item));
      setMembershipTypes(updated);
      syncDrafts(updated);
    } catch (error) {
      setMembershipError(error instanceof Error ? error.message : t("failedUpdateMembershipType"));
    } finally {
      setMembershipBusyId(null);
    }
  };

  const removeType = async (item: MembershipTypeRecord) => {
    const confirmed = window.confirm(t("deleteMembershipTypeConfirm").replace("{name}", item.name));
    if (!confirmed) return;

    try {
      setMembershipBusyId(item.id);
      setMembershipError(null);
      await deleteMembershipType(item.id, ownerKey.trim() || undefined);
      const updated = membershipTypes.filter((type) => type.id !== item.id);
      setMembershipTypes(updated);
      syncDrafts(updated);
    } catch (error) {
      setMembershipError(error instanceof Error ? error.message : t("failedDeleteMembershipType"));
    } finally {
      setMembershipBusyId(null);
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
                  {t("readOnly")}
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
                  <p className="text-sm font-semibold text-white">{t("membershipTypes")}</p>
                  <p className="text-xs text-slate-400">{t("ownerManagedBillingTypes")}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-xs text-slate-400">{t("ownerKeyRequiredIfConfigured")}</p>
                <input
                  type="password"
                  value={ownerKey}
                  onChange={(event) => setOwnerKey(event.target.value)}
                  placeholder={t("ownerKey")}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{t("newMembershipType")}</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  <input
                    value={newType.name}
                    onChange={(event) =>
                      setNewType((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder={t("name")}
                    className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                  <input
                    value={newType.priceMonthly}
                    onChange={(event) =>
                      setNewType((prev) => ({ ...prev, priceMonthly: event.target.value }))
                    }
                    placeholder={t("monthlyPriceOptional")}
                    className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                  <select
                    value={newType.planType}
                    onChange={(event) =>
                      setNewType((prev) => ({ ...prev, planType: event.target.value as PlanType }))
                    }
                    className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="monthly">{t("planTypeMonthly")}</option>
                    <option value="punch_card">{t("planTypePunchCard")}</option>
                    <option value="day_pass">{t("planTypeDayPass")}</option>
                    <option value="annual">{t("planTypeAnnual")}</option>
                    <option value="bimonthly">{t("planTypeBimonthly")}</option>
                    <option value="custom">{t("planTypeCustom")}</option>
                  </select>
                  <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                    <span>{t("active")}</span>
                    <input
                      type="checkbox"
                      checked={newType.isActive}
                      onChange={(event) =>
                        setNewType((prev) => ({ ...prev, isActive: event.target.checked }))
                      }
                    />
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={createType}
                    disabled={creatingMembership || !newType.name.trim()}
                  >
                    {creatingMembership ? t("saving") : t("addType")}
                  </button>
                </div>
              </div>

              {membershipError && <p className="text-xs text-rose-300">{membershipError}</p>}

              <div className="space-y-2">
                {membershipLoading ? (
                  <p className="text-sm text-slate-400">{t("loadingMembershipTypes")}</p>
                ) : membershipTypes.length === 0 ? (
                  <p className="text-sm text-slate-400">{t("noMembershipTypesConfigured")}</p>
                ) : (
                  membershipTypes.map((item) => {
                    const draft = drafts[item.id];
                    const busy = membershipBusyId === item.id;
                    if (!draft) return null;

                    return (
                      <div
                        key={item.id}
                        className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                      >
                        <div className="grid gap-2 sm:grid-cols-4">
                          <input
                            value={draft.name}
                            onChange={(event) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], name: event.target.value },
                              }))
                            }
                            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                          />
                          <input
                            value={draft.priceMonthly}
                            onChange={(event) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], priceMonthly: event.target.value },
                              }))
                            }
                            placeholder={t("monthlyPrice")}
                            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                          />
                          <select
                            value={draft.planType}
                            onChange={(event) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], planType: event.target.value as PlanType },
                              }))
                            }
                            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                          >
                            <option value="monthly">{t("planTypeMonthly")}</option>
                            <option value="punch_card">{t("planTypePunchCard")}</option>
                            <option value="day_pass">{t("planTypeDayPass")}</option>
                            <option value="annual">{t("planTypeAnnual")}</option>
                            <option value="bimonthly">{t("planTypeBimonthly")}</option>
                            <option value="custom">{t("planTypeCustom")}</option>
                          </select>
                          <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                            <span>{draft.isActive ? t("active") : t("inactive")}</span>
                            <input
                              type="checkbox"
                              checked={draft.isActive}
                              onChange={(event) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], isActive: event.target.checked },
                                }))
                              }
                            />
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {t("inUseByMembers").replace("{count}", String(item.members_count ?? 0))}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => saveType(item.id)}
                              disabled={busy}
                            >
                              {busy ? t("saving") : t("save")}
                            </button>
                            <button
                              className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => removeType(item)}
                              disabled={busy}
                            >
                              {t("delete")}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                    {value === "dark" ? t("dark") : t("dim")}
                  </button>
                ))}
              </div>
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
                  {t("infoCommandsOnly")}
                </p>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t("language")}</p>
                  <p className="text-xs text-slate-400">{t("language")}</p>
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
