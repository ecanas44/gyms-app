"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Waiver,
  WaiverStatus,
  createWaiver,
  deleteWaiver as deleteWaiverApi,
  fetchWaivers,
  updateWaiver as updateWaiverApi,
} from "../../services/waivers";
import { createCheckin } from "../../services/checkins";

const statusStyles: Record<WaiverStatus, string> = {
  Signed: "bg-emerald-500/20 text-emerald-100",
  Pending: "bg-amber-500/20 text-amber-100",
  Expired: "bg-rose-500/20 text-rose-100",
};

const drawerLinks: { label: string; href?: string }[] = [
  { label: "Overview", href: "/" },
  { label: "Waivers", href: "/waivers" },
  { label: "Members", href: "/members" },
  { label: "Check-ins", href: "/checkins" },
  { label: "Settings" },
];

export default function WaiversPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{
    id?: string;
    code?: string;
    member_name: string;
    member_email: string;
    signed_at: string;
    status: WaiverStatus;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchWaivers();
        setWaivers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load waivers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredWaivers = useMemo(() => {
    const term = search.toLowerCase();
    return waivers.filter(
      (w) =>
        w.member_name.toLowerCase().includes(term) ||
        w.member_email.toLowerCase().includes(term) ||
        w.code.toLowerCase().includes(term),
    );
  }, [search, waivers]);

  const statusCounts = useMemo(() => {
    return waivers.reduce(
      (acc, w) => {
        acc[w.status] += 1;
        return acc;
      },
      { Signed: 0, Pending: 0, Expired: 0 } as Record<WaiverStatus, number>,
    );
  }, [waivers]);

  const startNewWaiver = () => {
    setForm({
      member_name: "",
      member_email: "",
      signed_at: new Date().toISOString().slice(0, 10),
      status: "Pending",
    });
  };

  const editWaiver = (waiver: Waiver) =>
    setForm({
      id: waiver.id,
      code: waiver.code,
      member_name: waiver.member_name,
      member_email: waiver.member_email,
      signed_at: waiver.signed_at,
      status: waiver.status,
    });

  const saveWaiver = () => {
    if (!form) return;
    const payload = {
      code: form.code?.trim() || undefined,
      member_name: form.member_name.trim(),
      member_email: form.member_email.trim(),
      signed_at: form.signed_at,
      status: form.status,
    };

    const performSave = async () => {
      try {
        setError(null);
        if (form.id) {
          const updated = await updateWaiverApi(form.id, payload);
          setWaivers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
        } else {
          const created = await createWaiver(payload);
          setWaivers((prev) => [created, ...prev]);
        }
        setForm(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save waiver");
      }
    };

    performSave();
  };

const deleteWaiver = (id: string) => {
    const performDelete = async () => {
      try {
        setError(null);
        await deleteWaiverApi(id);
        setWaivers((prev) => prev.filter((w) => w.id !== id));
        if (form?.id === id) setForm(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete waiver");
      }
    };
    performDelete();
  };

  const checkInFromWaiver = (waiver: Waiver) => {
    const perform = async () => {
      try {
        setError(null);
        await createCheckin({ waiver_id: waiver.id, member_id: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create check-in");
      }
    };
    perform();
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
          {drawerLinks.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800/80"
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
        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm font-semibold text-slate-100">Today&apos;s load</p>
          <div className="mt-3 h-2 rounded-full bg-slate-800">
            <div className="h-2 w-3/4 rounded-full bg-emerald-400"></div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            18 active classes · 124 check-ins
          </p>
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
                  Waivers
                </p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  Intake and compliance
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 sm:inline-flex">
                New action
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-slate-900">
                ES
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-16 pt-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Waivers
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Intake and compliance
                  </h2>
                  {error && (
                    <p className="mt-1 text-xs text-rose-300">
                      {error}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or code"
                    className="w-full min-w-[240px] rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
                    onClick={startNewWaiver}
                  >
                    New waiver
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {(["Signed", "Pending", "Expired"] as WaiverStatus[]).map((status) => (
                  <div
                    key={status}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {status}
                    </p>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-white">
                        {statusCounts[status]}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                <div className="grid grid-cols-5 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <span>Member</span>
                  <span>Code</span>
                  <span>Signed</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {loading ? (
                    <div className="px-4 py-6 text-sm text-slate-400">Loading waivers…</div>
                  ) : (
                    <>
                      {filteredWaivers.map((waiver) => (
                        <div
                          key={waiver.id}
                          className="grid grid-cols-5 items-center px-4 py-4 text-sm text-slate-100"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{waiver.member_name}</span>
                            <span className="text-xs text-slate-400">{waiver.member_email}</span>
                          </div>
                          <span className="text-slate-300">{waiver.code}</span>
                          <span className="text-slate-300">
                            {new Date(waiver.signed_at).toLocaleDateString()}
                          </span>
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[waiver.status]}`}
                          >
                            {waiver.status}
                          </span>
                          <div className="flex justify-end gap-2">
                        <button
                          className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-emerald-500/20"
                          onClick={() => editWaiver(waiver)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                          onClick={() => deleteWaiver(waiver.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
                          onClick={() => checkInFromWaiver(waiver)}
                        >
                          Check-in
                        </button>
                      </div>
                    </div>
                  ))}
                      {filteredWaivers.length === 0 && (
                        <div className="px-4 py-6 text-sm text-slate-400">
                          No waivers match your search.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-sm font-semibold text-white">Capture checklist</p>
                <div className="mt-3 space-y-2 text-sm text-slate-100">
                  {[
                    "Collect signature + timestamp",
                    "Store PDF with member record",
                    "Flag expired waivers at check-in",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {form ? (form.id ? "Update waiver" : "Add waiver") : "Add or edit"}
                  </p>
                  {form && (
                    <button
                      className="text-xs text-slate-400 underline"
                      onClick={() => setForm(null)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {form ? (
                  <div className="mt-4 space-y-3 text-sm text-slate-100">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Code (optional)</label>
                      <input
                        value={form.code ?? ""}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev ? { ...prev, code: e.target.value } : prev,
                          )
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        placeholder="W-ABC123"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Member</label>
                      <input
                        value={form.member_name}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev ? { ...prev, member_name: e.target.value } : prev,
                          )
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Email</label>
                      <input
                        value={form.member_email}
                        onChange={(e) =>
                          setForm((prev) =>
                            prev ? { ...prev, member_email: e.target.value } : prev,
                          )
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Signed date</label>
                        <input
                          type="date"
                          value={form.signed_at}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, signed_at: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Status</label>
                        <select
                          value={form.status}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev
                                ? { ...prev, status: e.target.value as WaiverStatus }
                                : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        >
                          {(["Signed", "Pending", "Expired"] as WaiverStatus[]).map(
                            (status) => (
                              <option key={status}>{status}</option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">
                        Code {form.code ?? "(auto)"}
                      </span>
                      <button
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
                        onClick={saveWaiver}
                      >
                        {form.id ? "Update waiver" : "Save waiver"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <p>Select a waiver to edit, or add a new one.</p>
                    <button
                      className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-emerald-500/20"
                      onClick={startNewWaiver}
                    >
                      New waiver
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
