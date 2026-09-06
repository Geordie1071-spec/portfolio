"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export const ACCENT_PRESETS = [
  { id: "coral", label: "Coral", value: "#FF5A36" },
  { id: "amber", label: "Amber", value: "#F5A524" },
  { id: "lime", label: "Lime", value: "#B6F34B" },
  { id: "mint", label: "Mint", value: "#3DDC97" },
  { id: "sky", label: "Sky", value: "#4CC9F0" },
  { id: "violet", label: "Violet", value: "#9B5DE5" },
  { id: "rose", label: "Rose", value: "#F15BB5" },
  { id: "white", label: "White", value: "#F4F4F4" },
] as const;

export type AccentId = (typeof ACCENT_PRESETS)[number]["id"];

const STORAGE_KEY = "portfolio-accent";
const DEFAULT_ID: AccentId = "coral";
const listeners = new Set<() => void>();

function isAccentId(value: string | null): value is AccentId {
  return !!value && ACCENT_PRESETS.some((p) => p.id === value);
}

function readAccentId(): AccentId {
  if (typeof window === "undefined") return DEFAULT_ID;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isAccentId(saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_ID;
}

function writeAccentId(id: AccentId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function resolveAccent(id: AccentId) {
  return ACCENT_PRESETS.find((p) => p.id === id)?.value ?? ACCENT_PRESETS[0].value;
}

type AccentContextValue = {
  accentId: AccentId;
  accent: string;
  setAccentId: (id: AccentId) => void;
};

const AccentContext = createContext<AccentContextValue | null>(null);

export function AccentProvider({ children }: { children: ReactNode }) {
  const accentId = useSyncExternalStore(subscribe, readAccentId, () => DEFAULT_ID);
  const accent = resolveAccent(accentId);

  const setAccentId = useCallback((id: AccentId) => {
    writeAccentId(id);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.dataset.accent = accentId;
  }, [accent, accentId]);

  const value = useMemo(
    () => ({ accentId, accent, setAccentId }),
    [accentId, accent, setAccentId],
  );

  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}
