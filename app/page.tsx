"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/app/providers";
import { fetchMembers } from "@/services/members";
import { fetchWaivers } from "@/services/waivers";
import { fetchCheckins } from "@/services/checkins";
import type { MemberRecord } from "@/lib/members";
import type { Waiver } from "@/services/waivers";
import type { CheckinRecord } from "@/lib/checkins";

const statusStyles: Record<Waiver["status"], string> = {
  Signed: "bg-emerald-500/20 text-emerald-100",
  Pending: "bg-amber-500/20 text-amber-100",
  Expired: "bg-rose-500/20 text-rose-100",
};

export default function OverviewPage() {
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [m, w, c] = await Promise.all([
          fetchMembers(),
          fetchWaivers(),
          fetchCheckins(),
        ]);
        setMembers(m);
        setWaivers(w);
        setCheckins(c);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load overview data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const drawerLinks: { label: string; href?: string }[] = useMemo(
    () => [
      { label: t("overview"), href: "/" },
      { label: t("waivers"), href: "/waivers" },
      { label: t("members"), href: "/members" },
      { label: t("checkins"), href: "/checkins" },
      { label: t("settings"), href: "/settings" },
    ],
    [t],
  );

  const waiverStatusCounts = useMemo(
    () =>
      waivers.reduce(
        (acc, w) => {
          acc[w.status] += 1;
          return acc;
        },
        { Signed: 0, Pending: 0, Expired: 0 } as Record<Waiver["status"], number>,
      ),
    [waivers],
  );

  const metrics = [
    { label: t("activeMembers"), value: members.length.toString() },
    { label: t("totalWaivers"), value: waivers.length.toString() },
    { label: t("checkins24h"), value: checkins.slice(0, 100).length.toString() },
  ];

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
          {drawerLinks.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition hover:bg-slate-800/80 ${
                  item.href === "/" ? "text-white" : "text-slate-200"
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
                  {t("overview")}
                </p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  {t("liveSnapshot")}
                </h1>
                {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-16 pt-6 sm:px-8">
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
              {t("loadingData")}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="space-y-4 lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{t("waivers")}</p>
                      <h2 className="text-xl font-semibold text-white">
                        {t("statusAtGlance")}
                      </h2>
                    </div>
                    <Link
                      href="/waivers"
                      className="text-sm font-semibold text-emerald-300 underline"
                    >
                      {t("viewWaivers")}
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {(["Signed", "Pending", "Expired"] as Waiver["status"][]).map((status) => (
                      <div
                        key={status}
                        className="rounded-xl border border-slate-800 bg-slate-800/40 p-4"
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {status === "Signed"
                            ? t("signed")
                            : status === "Pending"
                              ? t("pending")
                              : t("expired")}
                        </p>
                        <div className="mt-2 flex items-end justify-between">
                          <p className="text-2xl font-semibold text-white">
                            {waiverStatusCounts[status]}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
                          >
                            {status === "Signed"
                              ? t("signed")
                              : status === "Pending"
                                ? t("pending")
                                : t("expired")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
                    <div className="grid grid-cols-4 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <span>{t("member")}</span>
                      <span>{t("code")}</span>
                      <span>{t("signedOn")}</span>
                      <span>{t("statusAtGlance").split(" ")[0]}</span>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {waivers.slice(0, 5).map((w) => (
                        <div
                          key={w.id}
                          className="grid grid-cols-4 items-center px-4 py-3 text-sm text-slate-100"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{w.member_name}</span>
                            <span className="text-xs text-slate-400">{w.member_email}</span>
                          </div>
                          <span className="text-slate-300">{w.code}</span>
                          <span className="text-slate-300">
                            {new Date(w.signed_at).toLocaleDateString()}
                          </span>
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[w.status]}`}
                          >
                            {w.status}
                          </span>
                        </div>
                      ))}
                      {waivers.length === 0 && (
                        <div className="px-4 py-4 text-sm text-slate-400">
                          {t("noWaivers")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{t("recentCheckins")}</p>
                    <Link
                      href="/checkins"
                      className="text-xs font-semibold text-emerald-300 underline"
                    >
                      {t("seeAll")}
                    </Link>
                  </div>
                  <div className="mt-3 space-y-3">
                    {checkins.slice(0, 6).map((c) => {
                      const member = members.find((m) => m.id === c.member_id);
                      const waiver = waivers.find((w) => w.id === c.waiver_id);
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-3 text-sm text-slate-100"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {member?.full_name ?? waiver?.member_name ?? "Unknown"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(c.checked_in_at).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-slate-300">
                            {c.source === "Member" ? t("sourceMember") : t("sourceOneDay")}
                          </span>
                        </div>
                      );
                    })}
                    {checkins.length === 0 && (
                      <p className="text-xs text-slate-400">{t("noCheckins")}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{t("members")}</p>
                    <Link
                      href="/members"
                      className="text-xs font-semibold text-emerald-300 underline"
                    >
                      {t("openRoster")}
                    </Link>
                  </div>
                  <div className="mt-3 space-y-3">
                    {members.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-3 text-sm text-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-emerald-200">
                            {m.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{m.full_name}</span>
                            <span className="text-xs text-slate-400">{m.email}</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-300">
                          {m.membership_type?.name ?? "—"}
                        </span>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="text-xs text-slate-400">{t("noMembers")}</p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
