"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MemberRecord } from "../../lib/members";
import { MembershipTypeRecord } from "../../lib/membership-types";
import { createMember, deleteMember, fetchMembers, updateMember } from "../../services/members";
import { fetchMembershipTypes } from "../../services/membership-types";
import { fetchWaivers } from "../../services/waivers";
import { Waiver } from "../../services/waivers";
import { createCheckin } from "../../services/checkins";

const drawerLinks: { label: string; href?: string }[] = [
  { label: "Overview", href: "/" },
  { label: "Waivers", href: "/waivers" },
  { label: "Members", href: "/members" },
  { label: "Check-ins", href: "/checkins" },
  { label: "Settings" },
];

const membershipBadgeClass = (isActive?: boolean) =>
  isActive ? "bg-emerald-500/20 text-emerald-100" : "bg-slate-700/50 text-slate-200";

const isPunchMembership = (membershipName?: string) =>
  membershipName ? membershipName.toLowerCase().includes("punch") : false;

export default function MembersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipTypeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    id?: string;
    waiver_id: string;
    full_name: string;
    email: string;
    phone: string;
    membership_type_id: string;
    start_date: string;
    punches_remaining: number | null;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setMembershipLoading(true);
        const [memberData, waiverData, membershipData] = await Promise.all([
          fetchMembers(),
          fetchWaivers(),
          fetchMembershipTypes(),
        ]);
        setMembers(memberData);
        setWaivers(waiverData);
        setMembershipTypes(membershipData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load members");
      } finally {
        setLoading(false);
        setMembershipLoading(false);
      }
    };
    load();
  }, []);

  const filteredMembers = useMemo(() => {
    const term = search.toLowerCase();
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.membership_type?.name.toLowerCase().includes(term),
    );
  }, [members, search]);

  const startNew = () => {
    const defaultMembership = membershipTypes.find((type) => type.is_active) ?? membershipTypes[0];
    setForm({
      waiver_id: waivers[0]?.id ?? "",
      full_name: "",
      email: "",
      phone: "",
      membership_type_id: defaultMembership?.id ?? "",
      start_date: new Date().toISOString().slice(0, 10),
      punches_remaining: 5,
    });
  };

  const editMember = (member: MemberRecord) => {
    setForm({
      id: member.id,
      waiver_id: member.waiver_id,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone ?? "",
      membership_type_id: member.membership_type_id,
      start_date: member.start_date,
      punches_remaining: member.punches_remaining ?? null,
    });
  };

  const saveMember = async () => {
    if (!form) return;
    if (!form.waiver_id) {
      setError("A waiver is required before adding a member.");
      return;
    }
    if (!form.membership_type_id) {
      setError("Select a membership type before saving.");
      return;
    }
    try {
      setError(null);
      const selectedMembership = membershipTypes.find(
        (type) => type.id === form.membership_type_id,
      );
      const payload = {
        waiver_id: form.waiver_id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        membership_type_id: form.membership_type_id,
        start_date: form.start_date,
        punches_remaining: isPunchMembership(selectedMembership?.name)
          ? form.punches_remaining ?? 5
          : null,
      };
      if (form.id) {
        const updated = await updateMember(form.id, payload);
        setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        const created = await createMember(payload);
        setMembers((prev) => [created, ...prev]);
      }
      setForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save member");
    }
  };

  const removeMember = async (id: string) => {
    try {
      setError(null);
      await deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (form?.id === id) setForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member");
    }
  };

  const checkInMember = async (member: MemberRecord) => {
    try {
      setError(null);
      await createCheckin({ member_id: member.id, waiver_id: member.waiver_id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create check-in");
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
          {drawerLinks.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition hover:bg-slate-800/80 ${
                  item.href === "/members" ? "text-white" : "text-slate-200"
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
                  Members
                </p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  Roster & billing
                </h1>
                {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
              </div>
            </div>
            <button
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
              onClick={startNew}
              disabled={membershipTypes.length === 0}
            >
              New member
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 pb-16 pt-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Members
                  </p>
                  <h2 className="text-xl font-semibold text-white">Active roster</h2>
                </div>
                <div className="flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, or type"
                    className="w-full min-w-[240px] rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-emerald-500/20"
                    onClick={() => setSearch("")}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                <div className="grid grid-cols-6 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Type</span>
                  <span>Waiver</span>
                  <span>Start</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {loading ? (
                    <div className="px-4 py-6 text-sm text-slate-400">Loading members…</div>
                  ) : (
                    <>
                      {filteredMembers.map((member) => {
                        const waiver = waivers.find((w) => w.id === member.waiver_id);
                        const typeName = member.membership_type?.name ?? "Unknown";
                        const showPunches = isPunchMembership(typeName);
                        return (
                          <div
                            key={member.id}
                            className="grid grid-cols-6 items-center px-4 py-4 text-sm text-slate-100"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {member.full_name}
                              </span>
                              <span className="text-xs text-slate-400">{member.phone ?? "—"}</span>
                            </div>
                            <span className="text-slate-300">{member.email}</span>
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${membershipBadgeClass(
                                member.membership_type?.is_active,
                              )}`}
                            >
                              {typeName}
                              {showPunches && member.punches_remaining != null
                                ? ` · ${member.punches_remaining} left`
                                : ""}
                            </span>
                            <span className="text-slate-300">
                              {waiver ? waiver.code : "—"}
                            </span>
                            <span className="text-slate-300">
                              {new Date(member.start_date).toLocaleDateString()}
                            </span>
                            <div className="flex justify-end gap-2">
                              <button
                                className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-emerald-500/20"
                                onClick={() => editMember(member)}
                              >
                                Edit
                              </button>
                              <button
                                className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                                onClick={() => removeMember(member.id)}
                              >
                                Delete
                              </button>
                              <button
                                className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
                                onClick={() => checkInMember(member)}
                              >
                                Check-in
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {filteredMembers.length === 0 && (
                        <div className="px-4 py-6 text-sm text-slate-400">
                          No members match your search.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {form ? (form.id ? "Update member" : "Add member") : "Add or edit"}
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
                      <label className="text-xs text-slate-400">Full name</label>
                      <input
                        value={form.full_name}
                        onChange={(e) =>
                          setForm((prev) => (prev ? { ...prev, full_name: e.target.value } : prev))
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        placeholder="Member name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Email</label>
                      <input
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => (prev ? { ...prev, email: e.target.value } : prev))
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) =>
                          setForm((prev) => (prev ? { ...prev, phone: e.target.value } : prev))
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Waiver</label>
                        <select
                          value={form.waiver_id}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, waiver_id: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        >
                          {waivers.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.member_name} — {w.code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Type</label>
                        <select
                          value={form.membership_type_id}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, membership_type_id: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        >
                          {membershipTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}{type.is_active ? "" : " (inactive)"}
                            </option>
                          ))}
                        </select>
                        {membershipLoading && (
                          <p className="text-xs text-slate-400">Loading membership types…</p>
                        )}
                        {!membershipLoading && membershipTypes.length === 0 && (
                          <p className="text-xs text-amber-300">
                            Add a membership type in Settings first.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Start date</label>
                        <input
                          type="date"
                          value={form.start_date}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, start_date: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                      {isPunchMembership(
                        membershipTypes.find((type) => type.id === form.membership_type_id)?.name,
                      ) && (
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">Punches remaining</label>
                          <input
                            type="number"
                            min={0}
                            value={form.punches_remaining ?? 0}
                            onChange={(e) =>
                              setForm((prev) =>
                                prev
                                  ? { ...prev, punches_remaining: Number(e.target.value) }
                                  : prev,
                              )
                            }
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">
                        Member ID {form.id ?? "(new)"} · Waiver required
                      </span>
                      <button
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
                        onClick={saveMember}
                        disabled={!form.waiver_id}
                      >
                        {form.id ? "Update member" : "Save member"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <p>Select a member to edit, or add a new one.</p>
                    <button
                      className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-emerald-500/20"
                      onClick={startNew}
                      disabled={waivers.length === 0 || membershipTypes.length === 0}
                    >
                      New member
                    </button>
                    {waivers.length === 0 && (
                      <p className="text-xs text-amber-300">
                        Add a waiver first—members must be linked to a waiver.
                      </p>
                    )}
                    {membershipTypes.length === 0 && (
                      <p className="text-xs text-amber-300">
                        Add a membership type in Settings before creating members.
                      </p>
                    )}
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
