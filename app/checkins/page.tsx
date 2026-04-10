"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckinRecord } from "../../lib/checkins";
import { fetchCheckins, deleteCheckin } from "../../services/checkins";
import { fetchMembers } from "../../services/members";
import { fetchWaivers } from "../../services/waivers";
import { MemberRecord } from "../../lib/members";
import { Waiver } from "../../services/waivers";
import { useI18n } from "../providers";

export default function CheckinsPage() {
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ci, ms, ws] = await Promise.all([
          fetchCheckins(),
          fetchMembers(),
          fetchWaivers(),
        ]);
        setCheckins(ci);
        setMembers(ms);
        setWaivers(ws);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedLoadCheckins"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const getMember = (id?: string | null) => members.find((m) => m.id === id);
  const getWaiver = (id: string) => waivers.find((w) => w.id === id);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return checkins.filter((c) => {
      const member = members.find((m) => m.id === c.member_id);
      const waiver = waivers.find((w) => w.id === c.waiver_id);
      return (
        (member?.full_name.toLowerCase().includes(term) ?? false) ||
        (member?.email.toLowerCase().includes(term) ?? false) ||
        (waiver?.member_name.toLowerCase().includes(term) ?? false) ||
        (waiver?.member_email.toLowerCase().includes(term) ?? false) ||
        c.source.toLowerCase().includes(term)
      );
    });
  }, [checkins, search, members, waivers]);

  const remove = async (id: string) => {
    try {
      setError(null);
      await deleteCheckin(id);
      setCheckins((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedDeleteCheckin"));
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      <div
        className={`fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-full transform bg-slate-950/80 px-6 py-8 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Gyms CRM
          </div>
          <button
            className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className="mt-8 space-y-1">
          {[
            { label: t("overview"), href: "/" },
            { label: t("waivers"), href: "/waivers" },
            { label: t("members"), href: "/members" },
            { label: t("checkins"), href: "/checkins" },
            { label: t("settings") },
          ].map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition hover:bg-slate-800/80 ${
                  item.href === "/checkins" ? "text-white" : "text-slate-200"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">›</span>
              </Link>
            ) : (
              <button
                key={item.label}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800/80"
                onClick={() => setDrawerOpen(false)}
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">›</span>
              </button>
            ),
          )}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-20 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-100 transition hover:bg-slate-700 lg:hidden"
                onClick={() => setDrawerOpen((open) => !open)}
                aria-label="Toggle menu"
              >
                <span className="text-xl">☰</span>
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t("checkins")}
                </p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  {t("checkinsRecentActivity")}
                </h1>
                {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-16 pt-6 sm:px-8">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t("checkins")}
                </p>
                <h2 className="text-xl font-semibold text-white">{t("mostRecentFirst")}</h2>
              </div>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchByMemberWaiverSource")}
                  className="w-full min-w-[240px] rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-emerald-500/20"
                  onClick={() => setSearch("")}
                >
                  {t("clear")}
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="grid grid-cols-5 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>{t("time")}</span>
                <span>{t("source")}</span>
                <span>{t("name")}</span>
                <span>{t("waiver")}</span>
                <span className="text-right">{t("actions")}</span>
              </div>
              <div className="divide-y divide-slate-800">
                {loading ? (
                  <div className="px-4 py-6 text-sm text-slate-400">{t("loadingCheckins")}</div>
                ) : (
                  <>
                    {filtered.map((c) => {
                      const member = getMember(c.member_id);
                      const waiver = getWaiver(c.waiver_id);
                      return (
                        <div
                          key={c.id}
                          className="grid grid-cols-5 items-center px-4 py-4 text-sm text-slate-100"
                        >
                          <span className="text-slate-300">
                            {new Date(c.checked_in_at).toLocaleString()}
                          </span>
                          <span className="text-slate-200">{c.source === "Member" ? t("sourceMember") : t("sourceOneDay")}</span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {member?.full_name ?? waiver?.member_name ?? t("unknown")}
                            </span>
                            <span className="text-xs text-slate-400">
                              {member?.email ?? waiver?.member_email ?? "—"}
                            </span>
                          </div>
                          <span className="text-slate-300">{waiver?.code ?? "—"}</span>
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                              onClick={() => remove(c.id)}
                            >
                              {t("delete")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className="px-4 py-6 text-sm text-slate-400">
                        {t("noCheckinsMatchSearch")}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
