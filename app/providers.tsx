"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "es";
export type AppTheme = "dark" | "dim";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const ThemeContext = createContext<
  | {
      theme: AppTheme;
      setTheme: (theme: AppTheme) => void;
    }
  | undefined
>(undefined);

const translations: Record<Lang, Record<string, string>> = {
  en: {
    overview: "Overview",
    waivers: "Waivers",
    waiver: "Waiver",
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
    readOnly: "Read-only",
    notAvailableClient: "Not available in client build",
    notSet: "Not set",
    membershipTypes: "Membership types",
    ownerManagedBillingTypes: "Owner-managed billing types",
    ownerKeyRequiredIfConfigured: "Owner key (required only if `OWNER_SETTINGS_KEY` is set on the server)",
    ownerKey: "Owner key",
    newMembershipType: "New membership type",
    name: "Name",
    monthlyPriceOptional: "Monthly price (optional)",
    monthlyPrice: "Monthly price",
    active: "Active",
    inactive: "Inactive",
    saving: "Saving...",
    addType: "Add type",
    loadingMembershipTypes: "Loading membership types...",
    noMembershipTypesConfigured: "No membership types configured.",
    inUseByMembers: "In use by {count} member(s)",
    save: "Save",
    dark: "Dark",
    dim: "Dim",
    infoCommandsOnly: "(These commands are informational only; run them in your terminal.)",
    failedLoadMembershipTypes: "Failed to load membership types",
    failedCreateMembershipType: "Failed to create membership type",
    failedUpdateMembershipType: "Failed to update membership type",
    failedDeleteMembershipType: "Failed to delete membership type",
    priceMustBeNonNegative: "Price must be a non-negative number",
    deleteMembershipTypeConfirm: "Delete membership type \"{name}\"?",
    checkinsRecentActivity: "Recent activity",
    mostRecentFirst: "Most recent first",
    searchByMemberWaiverSource: "Search by member, waiver, or source",
    time: "Time",
    source: "Source",
    unknown: "Unknown",
    clear: "Clear",
    delete: "Delete",
    loadingCheckins: "Loading check-ins…",
    noCheckinsMatchSearch: "No check-ins match your search.",
    failedLoadCheckins: "Failed to load check-ins",
    failedDeleteCheckin: "Failed to delete check-in",
    waiversTodayLoad: "Today's load",
    activeClassesAndCheckins: "18 active classes · 124 check-ins",
    newAction: "New action",
    searchByNameEmailCode: "Search by name, email, or code",
    loadingWaivers: "Loading waivers…",
    noWaiversMatchSearch: "No waivers match your search.",
    captureChecklist: "Capture checklist",
    collectSignatureTimestamp: "Collect signature + timestamp",
    storePdfWithMember: "Store PDF with member record",
    flagExpiredAtCheckin: "Flag expired waivers at check-in",
    updateWaiver: "Update waiver",
    addOrEdit: "Add or edit",
    cancel: "Cancel",
    codeOptional: "Code (optional)",
    fullName: "Full name",
    signedDate: "Signed date",
    status: "Status",
    codeAuto: "Code {code}",
    saveWaiver: "Save waiver",
    selectWaiverToEdit: "Select a waiver to edit, or add a new one.",
    failedLoadWaivers: "Failed to load waivers",
    failedSaveWaiver: "Failed to save waiver",
    failedDeleteWaiver: "Failed to delete waiver",
    failedCreateCheckin: "Failed to create check-in",
    membersRosterBilling: "Roster & billing",
    activeRoster: "Active roster",
    searchByNameEmailType: "Search by name, email, or type",
    type: "Type",
    start: "Start",
    actions: "Actions",
    loadingMembers: "Loading members…",
    punchesLeft: "{count} left",
    edit: "Edit",
    checkin: "Check-in",
    noMembersMatchSearch: "No members match your search.",
    updateMember: "Update member",
    addOrEditMember: "Add or edit",
    memberNamePlaceholder: "Member name",
    phone: "Phone",
    startDate: "Start date",
    punchesRemaining: "Punches remaining",
    memberIdWaiverRequired: "Member ID {id} · Waiver required",
    saveMember: "Save member",
    addMembershipTypeInSettings: "Add a membership type in Settings before creating members.",
    selectMemberToEdit: "Select a member to edit, or add a new one.",
    addWaiverFirst: "Add a waiver first—members must be linked to a waiver.",
    addMembershipTypeFirst: "Add a membership type first in Settings.",
    failedLoadMembers: "Failed to load members",
    failedSaveMember: "Failed to save member",
    failedDeleteMember: "Failed to delete member",
    membershipTypeRequired: "A membership type is required before adding a member.",
  },
  es: {
    overview: "Resumen",
    waivers: "Exenciones",
    waiver: "Exención",
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
    readOnly: "Solo lectura",
    notAvailableClient: "No disponible en compilación cliente",
    notSet: "No configurado",
    membershipTypes: "Tipos de membresía",
    ownerManagedBillingTypes: "Tipos de cobro gestionados por propietario",
    ownerKeyRequiredIfConfigured: "Clave de propietario (solo requerida si `OWNER_SETTINGS_KEY` está configurada en el servidor)",
    ownerKey: "Clave de propietario",
    newMembershipType: "Nuevo tipo de membresía",
    name: "Nombre",
    monthlyPriceOptional: "Precio mensual (opcional)",
    monthlyPrice: "Precio mensual",
    active: "Activo",
    inactive: "Inactivo",
    saving: "Guardando...",
    addType: "Agregar tipo",
    loadingMembershipTypes: "Cargando tipos de membresía...",
    noMembershipTypesConfigured: "No hay tipos de membresía configurados.",
    inUseByMembers: "En uso por {count} miembro(s)",
    save: "Guardar",
    dark: "Oscuro",
    dim: "Tenue",
    infoCommandsOnly: "(Estos comandos son solo informativos; ejecútalos en tu terminal.)",
    failedLoadMembershipTypes: "No se pudieron cargar los tipos de membresía",
    failedCreateMembershipType: "No se pudo crear el tipo de membresía",
    failedUpdateMembershipType: "No se pudo actualizar el tipo de membresía",
    failedDeleteMembershipType: "No se pudo eliminar el tipo de membresía",
    priceMustBeNonNegative: "El precio debe ser un número no negativo",
    deleteMembershipTypeConfirm: "¿Eliminar el tipo de membresía \"{name}\"?",
    checkinsRecentActivity: "Actividad reciente",
    mostRecentFirst: "Más recientes primero",
    searchByMemberWaiverSource: "Buscar por miembro, exención o origen",
    time: "Hora",
    source: "Origen",
    unknown: "Desconocido",
    clear: "Limpiar",
    delete: "Eliminar",
    loadingCheckins: "Cargando entradas…",
    noCheckinsMatchSearch: "Ninguna entrada coincide con tu búsqueda.",
    failedLoadCheckins: "No se pudieron cargar las entradas",
    failedDeleteCheckin: "No se pudo eliminar la entrada",
    waiversTodayLoad: "Carga de hoy",
    activeClassesAndCheckins: "18 clases activas · 124 entradas",
    newAction: "Nueva acción",
    searchByNameEmailCode: "Buscar por nombre, correo o código",
    loadingWaivers: "Cargando exenciones…",
    noWaiversMatchSearch: "Ninguna exención coincide con tu búsqueda.",
    captureChecklist: "Lista de control",
    collectSignatureTimestamp: "Recopilar firma y marca de tiempo",
    storePdfWithMember: "Guardar PDF con el registro del miembro",
    flagExpiredAtCheckin: "Marcar exenciones vencidas en la entrada",
    updateWaiver: "Actualizar exención",
    addOrEdit: "Agregar o editar",
    cancel: "Cancelar",
    codeOptional: "Código (opcional)",
    fullName: "Nombre completo",
    signedDate: "Fecha de firma",
    status: "Estado",
    codeAuto: "Código {code}",
    saveWaiver: "Guardar exención",
    selectWaiverToEdit: "Selecciona una exención para editar, o agrega una nueva.",
    failedLoadWaivers: "No se pudieron cargar las exenciones",
    failedSaveWaiver: "No se pudo guardar la exención",
    failedDeleteWaiver: "No se pudo eliminar la exención",
    failedCreateCheckin: "No se pudo crear la entrada",
    membersRosterBilling: "Lista y facturación",
    activeRoster: "Lista activa",
    searchByNameEmailType: "Buscar por nombre, correo o tipo",
    type: "Tipo",
    start: "Inicio",
    actions: "Acciones",
    loadingMembers: "Cargando miembros…",
    punchesLeft: "{count} restantes",
    edit: "Editar",
    checkin: "Entrada",
    noMembersMatchSearch: "Ningún miembro coincide con tu búsqueda.",
    updateMember: "Actualizar miembro",
    addOrEditMember: "Agregar o editar",
    memberNamePlaceholder: "Nombre del miembro",
    phone: "Teléfono",
    startDate: "Fecha de inicio",
    punchesRemaining: "Entradas restantes",
    memberIdWaiverRequired: "ID de miembro {id} · Exención requerida",
    saveMember: "Guardar miembro",
    addMembershipTypeInSettings: "Agrega un tipo de membresía en Configuración antes de crear miembros.",
    selectMemberToEdit: "Selecciona un miembro para editar, o agrega uno nuevo.",
    addWaiverFirst: "Agrega primero una exención: los miembros deben estar vinculados a una exención.",
    addMembershipTypeFirst: "Agrega primero un tipo de membresía en Configuración.",
    failedLoadMembers: "No se pudieron cargar los miembros",
    failedSaveMember: "No se pudo guardar el miembro",
    failedDeleteMember: "No se pudo eliminar el miembro",
    membershipTypeRequired: "Se requiere un tipo de membresía antes de agregar un miembro.",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("app-lang") as Lang | null;
    if (saved === "en" || saved === "es") return saved;
    const browserLang = window.navigator.language.toLowerCase();
    return browserLang.startsWith("es") ? "es" : "en";
  });

  useEffect(() => {
    window.localStorage.setItem("app-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string) => translations[lang][key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("app-theme") as AppTheme | null;
    return saved === "dark" || saved === "dim" ? saved : "dark";
  });

  useEffect(() => {
    window.localStorage.setItem("app-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
