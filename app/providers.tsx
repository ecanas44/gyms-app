"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "es";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const translations: Record<Lang, Record<string, string>> = {
  en: {
    overview: "Overview",
    waivers: "Waivers",
    members: "Members",
    checkins: "Check-ins",
    settings: "Settings",
    liveSnapshot: "Live snapshot",
    activeMembers: "Active members",
    totalWaivers: "Total waivers",
    checkins24h: "Check-ins (last 24h)",
    statusAtGlance: "Status at a glance",
    viewWaivers: "View waivers",
    recentCheckins: "Recent check-ins",
    seeAll: "See all",
    openRoster: "Open roster",
    noData: "No data yet.",
    signed: "Signed",
    pending: "Pending",
    expired: "Expired",
    member: "Member",
    code: "Code",
    signedOn: "Signed",
    sourceMember: "Member",
    sourceOneDay: "One-day",
    loadingData: "Loading live data…",
    addMember: "Add member",
    rosterAndActivity: "Roster and activity",
    intakeCompliance: "Intake and compliance",
    searchPlaceholder: "Search by name, email, or code",
    newWaiver: "New waiver",
    noWaivers: "No waivers yet.",
    noMembers: "No members yet.",
    noCheckins: "No check-ins yet.",
    waiverRequired: "A waiver is required before adding a member.",
    workspaceSettings: "Workspace settings",
    supabaseConnection: "Supabase connection",
    projectCredentials: "Project credentials used by the app",
    appearance: "Appearance",
    themePref: "Theme preference",
    dataTools: "Data tools",
    localDevHelpers: "Local dev helpers",
    url: "URL",
    anonKey: "Anon key",
    serviceRoleKey: "Service role key",
    show: "Show",
    hide: "Hide",
    language: "Language",
    english: "English",
    spanish: "Spanish",
  },
  es: {
    overview: "Resumen",
    waivers: "Exenciones",
    members: "Miembros",
    checkins: "Entradas",
    settings: "Configuración",
    liveSnapshot: "Instantánea en vivo",
    activeMembers: "Miembros activos",
    totalWaivers: "Exenciones totales",
    checkins24h: "Entradas (últimas 24h)",
    statusAtGlance: "Estado a simple vista",
    viewWaivers: "Ver exenciones",
    recentCheckins: "Entradas recientes",
    seeAll: "Ver todo",
    openRoster: "Abrir lista",
    noData: "Sin datos aún.",
    signed: "Firmado",
    pending: "Pendiente",
    expired: "Vencido",
    member: "Miembro",
    code: "Código",
    signedOn: "Firmado",
    sourceMember: "Miembro",
    sourceOneDay: "Pase de un día",
    loadingData: "Cargando datos en vivo…",
    addMember: "Agregar miembro",
    rosterAndActivity: "Lista y actividad",
    intakeCompliance: "Ingreso y cumplimiento",
    searchPlaceholder: "Buscar por nombre, correo o código",
    newWaiver: "Nueva exención",
    noWaivers: "Aún no hay exenciones.",
    noMembers: "Aún no hay miembros.",
    noCheckins: "Aún no hay entradas.",
    waiverRequired: "Se requiere una exención antes de agregar un miembro.",
    workspaceSettings: "Configuración del espacio de trabajo",
    supabaseConnection: "Conexión Supabase",
    projectCredentials: "Credenciales del proyecto usadas por la app",
    appearance: "Apariencia",
    themePref: "Preferencia de tema",
    dataTools: "Herramientas de datos",
    localDevHelpers: "Ayudas para desarrollo local",
    url: "URL",
    anonKey: "Clave anónima",
    serviceRoleKey: "Clave de servicio",
    show: "Mostrar",
    hide: "Ocultar",
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("app-lang") as Lang | null;
    return saved === "en" || saved === "es" ? saved : "en";
  });

  useEffect(() => {
    window.localStorage.setItem("app-lang", lang);
  }, [lang]);

  const t = useCallback((key: string) => translations[lang][key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
