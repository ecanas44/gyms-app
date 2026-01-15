"use client";

import { type ReactNode, useMemo, useState } from "react";

type TabKey = "dashboard" | "members" | "classes" | "waivers" | "profile";

type Tab = { key: TabKey; label: string; icon: ReactNode };

type WaiverStatus = "Signed" | "Pending" | "Expired";

type Waiver = {
  id: string;
  member: string;
  email: string;
  signedAt: string;
  status: WaiverStatus;
};

const dashboardMetrics = [
  { label: "Active members", value: "1,284", delta: "+12% vs last week" },
  { label: "Monthly revenue", value: "$82,140", delta: "+8.3% M/M" },
  { label: "Check-ins today", value: "342", delta: "peak 6-8pm" },
  { label: "Avg. class fill", value: "78%", delta: "goal 85%" },
];

const memberList = [
  {
    name: "María Ortega",
    plan: "Elite · 12 mo",
    attendance: "18 visits",
    status: "Active",
  },
  {
    name: "James Miller",
    plan: "Standard · 6 mo",
    attendance: "9 visits",
    status: "At risk",
  },
  {
    name: "Sofía Díaz",
    plan: "Daytime · 1 mo",
    attendance: "12 visits",
    status: "New",
  },
  {
    name: "Aiden Chen",
    plan: "Performance · 12 mo",
    attendance: "25 visits",
    status: "Active",
  },
];

const classSchedule = [
  { name: "HIIT Burn", time: "12:30", room: "Studio A", fill: 82 },
  { name: "Spin Strong", time: "14:00", room: "Studio B", fill: 91 },
  { name: "Box Fit", time: "17:15", room: "Studio C", fill: 76 },
  { name: "Pilates Core", time: "18:00", room: "Studio D", fill: 64 },
  { name: "Strength 45", time: "19:15", room: "Floor", fill: 88 },
];

const invoices = [
  { member: "María Ortega", amount: "$120.00", status: "Paid", date: "Jul 02" },
  { member: "James Miller", amount: "$75.00", status: "Due", date: "Jul 01" },
  { member: "Sofía Díaz", amount: "$49.00", status: "Paid", date: "Jun 30" },
  { member: "Aiden Chen", amount: "$99.00", status: "Paid", date: "Jun 29" },
];

const profileStats = [
  { label: "Gyms managed", value: "3" },
  { label: "Staff onboarded", value: "12" },
  { label: "Automations", value: "6 live" },
];

const membershipMix: { label: string; percent: number }[] = [
  { label: "Elite", percent: 42 },
  { label: "Standard", percent: 31 },
  { label: "Daytime", percent: 18 },
  { label: "Trial", percent: 9 },
];

const pipelineStages: { label: string; count: number }[] = [
  { label: "Leads", count: 38 },
  { label: "Trials", count: 24 },
  { label: "Pending payments", count: 9 },
];

const waitlists: { name: string; count: number }[] = [
  { name: "Spin Strong", count: 14 },
  { name: "Strength 45", count: 9 },
  { name: "Pilates Core", count: 6 },
];

const statusStyles: Record<WaiverStatus, string> = {
  Signed: "bg-emerald-500/20 text-emerald-100",
  Pending: "bg-amber-500/20 text-amber-100",
  Expired: "bg-rose-500/20 text-rose-100",
};

const seedWaivers: Waiver[] = [
  {
    id: "W-001",
    member: "María Ortega",
    email: "maria.ortega@email.com",
    signedAt: "2024-06-18",
    status: "Signed",
  },
  {
    id: "W-002",
    member: "James Miller",
    email: "james.miller@email.com",
    signedAt: "2024-06-30",
    status: "Pending",
  },
  {
    id: "W-003",
    member: "Sofía Díaz",
    email: "sofia.diaz@email.com",
    signedAt: "2024-07-01",
    status: "Signed",
  },
  {
    id: "W-004",
    member: "Aiden Chen",
    email: "aiden.chen@email.com",
    signedAt: "2024-05-12",
    status: "Expired",
  },
  {
    id: "W-005",
    member: "Carlos Gómez",
    email: "carlos.gomez@email.com",
    signedAt: "2024-07-02",
    status: "Pending",
  },
];

const tabs: Tab[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        aria-hidden="true"
      >
        <path d="M10 3h4v7h-4zM5 10h4v11H5zM15 13h4v8h-4z" />
      </svg>
    ),
  },
  {
    key: "members",
    label: "Members",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        aria-hidden="true"
      >
        <path d="M7 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm10.5-1.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7ZM3 19.5c0-3.5 3.5-5 7-5s7 1.5 7 5v1H3Zm12.5-6.5c-1 0-2 .2-2.9.6a6.1 6.1 0 0 1 3.4 5.4v1H21v-1c0-3-2.8-6-5.5-6Z" />
      </svg>
    ),
  },
  {
    key: "classes",
    label: "Classes",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        aria-hidden="true"
      >
        <path d="M7 3h10a2 2 0 0 1 2 2v14l-7-3-7 3V5a2 2 0 0 1 2-2Z" />
      </svg>
    ),
  },
  {
    key: "waivers",
    label: "Waivers",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        aria-hidden="true"
      >
        <path d="M6 3h9l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v14h11V9h-4V5H6Zm2 4h7v2H8V9Zm0 4h7v2H8v-2Z" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Profile",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        aria-hidden="true"
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-3.3 0-9 1.7-9 5v1h18v-1c0-3.3-5.7-5-9-5Z" />
      </svg>
    ),
  },
];

const drawerLinks = [
  "Overview",
  "Bookings",
  "Trainers",
  "Payments",
  "Waivers",
  "Settings",
];

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [waivers, setWaivers] = useState<Waiver[]>(seedWaivers);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{
    id?: string;
    member: string;
    email: string;
    signedAt: string;
    status: WaiverStatus;
  } | null>(null);

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label;

  const filteredWaivers = useMemo(() => {
    const term = search.toLowerCase();
    return waivers.filter(
      (w) =>
        w.member.toLowerCase().includes(term) ||
        w.email.toLowerCase().includes(term) ||
        w.id.toLowerCase().includes(term),
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
      member: "",
      email: "",
      signedAt: new Date().toISOString().slice(0, 10),
      status: "Pending",
    });
  };

  const editWaiver = (waiver: Waiver) => {
    setForm({ ...waiver });
  };

  const saveWaiver = () => {
    if (!form) return;
    const payload: Waiver = {
      id: form.id ?? `W-${(waivers.length + 1).toString().padStart(3, "0")}`,
      member: form.member.trim(),
      email: form.email.trim(),
      signedAt: form.signedAt,
      status: form.status,
    };

    setWaivers((prev) => {
      const exists = prev.some((w) => w.id === payload.id);
      if (exists) {
        return prev.map((w) => (w.id === payload.id ? payload : w));
      }
      return [payload, ...prev];
    });
    setForm(null);
  };

  const deleteWaiver = (id: string) => {
    setWaivers((prev) => prev.filter((w) => w.id !== id));
    if (form?.id === id) setForm(null);
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
          {drawerLinks.map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800/80"
            >
              <span>{item}</span>
              <span className="text-xs text-slate-400">›</span>
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm font-semibold text-slate-100">
            Today&apos;s load
          </p>
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
                  {activeLabel}
                </p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  {activeLabel} Overview
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

        <main className="flex-1 px-5 pb-28 pt-6 sm:px-8 sm:pb-16">
          {activeTab === "dashboard" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="space-y-4 lg:col-span-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/40">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {dashboardMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-xl border border-slate-800/60 bg-slate-800/50 p-4"
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {metric.label}
                        </p>
                        <div className="mt-2 flex items-end justify-between">
                          <p className="text-3xl font-semibold text-white">
                            {metric.value}
                          </p>
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                            {metric.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Engagement timeline
                      </p>
                      <h2 className="text-xl font-semibold text-white">
                        Check-ins past 7 days
                      </h2>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                      Peak Thu 6:30pm
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-7 gap-3 text-center text-xs text-slate-400">
                    {["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"].map(
                      (day, idx) => {
                        const heights = [60, 45, 38, 74, 80, 92, 96];
                        return (
                          <div
                            key={day}
                            className="flex flex-col items-center gap-2"
                          >
                            <div className="flex h-36 w-7 items-end justify-center rounded-full bg-slate-800/60">
                              <div
                                className="w-4 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                                style={{ height: `${heights[idx]}%` }}
                              />
                            </div>
                            <span>{day}</span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Quick actions
                  </p>
                  <div className="mt-4 space-y-3">
                    {["Add member", "Schedule class", "Send campaign"].map(
                      (action) => (
                        <button
                          key={action}
                          className="flex w-full items-center justify-between rounded-lg bg-slate-800/70 px-3 py-3 text-left text-sm font-medium text-slate-100 transition hover:bg-emerald-500/15"
                        >
                          <span>{action}</span>
                          <span className="text-lg">→</span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Upcoming classes
                  </p>
                  <div className="mt-3 space-y-3">
                    {classSchedule.slice(0, 3).map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.time} · {item.room}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-100">
                          {item.fill}% full
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">Pipeline</p>
                  <div className="mt-4 space-y-2">
                    {pipelineStages.map(({ label, count }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-emerald-400"
                            style={{ width: `${Math.min(count * 3, 100)}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-xs text-slate-300">
                          {count}
                        </span>
                        <span className="w-24 text-xs text-slate-400">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "members" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Members
                    </p>
                    <h2 className="text-xl font-semibold text-white">
                      Roster and activity
                    </h2>
                  </div>
                  <button className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-emerald-500/15">
                    Add member
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                  <div className="grid grid-cols-4 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <span>Name</span>
                    <span>Plan</span>
                    <span>Attendance</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {memberList.map((member) => (
                      <div
                        key={member.name}
                        className="grid grid-cols-4 items-center px-4 py-4 text-sm text-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-emerald-200">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span>{member.name}</span>
                        </div>
                        <span className="text-slate-300">{member.plan}</span>
                        <span className="text-slate-300">
                          {member.attendance}
                        </span>
                        <div className="flex justify-end">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              member.status === "Active"
                                ? "bg-emerald-500/15 text-emerald-100"
                                : member.status === "At risk"
                                  ? "bg-amber-500/15 text-amber-100"
                                  : "bg-cyan-500/15 text-cyan-100"
                            }`}
                          >
                            {member.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Membership mix
                  </p>
                  <div className="mt-4 space-y-3">
                    {membershipMix.map(({ label, percent }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>{label}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Invoices
                  </p>
                  <div className="mt-3 space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.member}
                        className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-3 text-sm text-slate-100"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {invoice.member}
                          </p>
                          <p className="text-xs text-slate-400">
                            {invoice.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-200">
                            {invoice.amount}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              invoice.status === "Paid"
                                ? "bg-emerald-500/20 text-emerald-100"
                                : "bg-amber-500/20 text-amber-100"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "classes" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Classes
                    </p>
                    <h2 className="text-xl font-semibold text-white">
                      Schedule and occupancy
                    </h2>
                  </div>
                  <button className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-emerald-500/15">
                    Add class
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
                  <div className="grid grid-cols-4 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <span>Class</span>
                    <span>Time</span>
                    <span>Room</span>
                    <span className="text-right">Fill</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {classSchedule.map((item) => (
                      <div
                        key={item.name}
                        className="grid grid-cols-4 items-center px-4 py-4 text-sm text-slate-100"
                      >
                        <span className="font-semibold text-white">
                          {item.name}
                        </span>
                        <span className="text-slate-300">{item.time}</span>
                        <span className="text-slate-300">{item.room}</span>
                        <div className="flex justify-end">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-slate-800">
                              <div
                                className="h-2 rounded-full bg-emerald-400"
                                style={{ width: `${item.fill}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-300">
                              {item.fill}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Trainers on deck
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-slate-100">
                    {[
                      ["Lena", "Strength · 8 classes"],
                      ["Marco", "Cycling · 6 classes"],
                      ["Priya", "HIIT · 5 classes"],
                    ].map(([name, info]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-xs font-bold text-slate-900">
                            {name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{name}</p>
                            <p className="text-xs text-slate-400">{info}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Waitlist pressure
                  </p>
                  <div className="mt-4 space-y-3">
                    {waitlists.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm text-slate-100"
                      >
                        <span>{item.name}</span>
                        <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-100">
                          {item.count} waiting
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "waivers" && (
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
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, email, or ID"
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
                  {(["Signed", "Pending", "Expired"] as WaiverStatus[]).map(
                    (status) => (
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
                    ),
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                  <div className="grid grid-cols-5 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <span>Member</span>
                    <span>ID</span>
                    <span>Signed</span>
                    <span>Status</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {filteredWaivers.map((waiver) => (
                      <div
                        key={waiver.id}
                        className="grid grid-cols-5 items-center px-4 py-4 text-sm text-slate-100"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {waiver.member}
                          </span>
                          <span className="text-xs text-slate-400">
                            {waiver.email}
                          </span>
                        </div>
                        <span className="text-slate-300">{waiver.id}</span>
                        <span className="text-slate-300">
                          {new Date(waiver.signedAt).toLocaleDateString()}
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
                        </div>
                      </div>
                    ))}
                    {filteredWaivers.length === 0 && (
                      <div className="px-4 py-6 text-sm text-slate-400">
                        No waivers match your search.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Capture checklist
                  </p>
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
                        <label className="text-xs text-slate-400">Member</label>
                        <input
                          value={form.member}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, member: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Email</label>
                        <input
                          value={form.email}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, email: e.target.value } : prev,
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
                            value={form.signedAt}
                            onChange={(e) =>
                              setForm((prev) =>
                                prev ? { ...prev, signedAt: e.target.value } : prev,
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
                          ID {form.id ?? "(auto)"}
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
          )}

          {activeTab === "profile" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-xl font-bold text-slate-900">
                      ES
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Owner
                      </p>
                      <h2 className="text-2xl font-semibold text-white">
                        Esteban S.
                      </h2>
                      <p className="text-sm text-slate-300">
                        Multi-location operator · Joined Jan 2024
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {profileStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-slate-800/60 bg-slate-800/50 p-4"
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {stat.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Automation
                      </p>
                      <h3 className="text-xl font-semibold text-white">
                        Engagement playbooks
                      </h3>
                    </div>
                    <button className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-emerald-500/15">
                      Add rule
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Day 0 welcome sequence",
                      "Class no-show reminder",
                      "Freeze expiring alert",
                    ].map((flow) => (
                      <div
                        key={flow}
                        className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-3 text-sm text-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]" />
                          <span>{flow}</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                          Live
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">
                    Notifications
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-100">
                    {[
                      ["New lead: Carlos booked a tour", "2m ago"],
                      ["Invoice paid: $120 · María", "1h ago"],
                      ["Spin Strong waitlist at 14", "3h ago"],
                    ].map(([title, time]) => (
                      <div
                        key={title}
                        className="rounded-lg bg-slate-800/50 px-3 py-3"
                      >
                        <p className="font-semibold text-white">{title}</p>
                        <p className="text-xs text-slate-400">{time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-sm font-semibold text-white">Profile</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Role</span>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                        Owner
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Plan</span>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                        Growth
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Notifications</span>
                      <span className="text-emerald-200">Enabled</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
                  isActive
                    ? "text-emerald-200"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <span
                  className={`text-xl transition ${
                    isActive ? "drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]" : ""
                  }`}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
