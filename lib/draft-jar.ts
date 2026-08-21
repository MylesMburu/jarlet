export type SealMode = "manual" | "date" | "count";

export const DRAFT_JAR_KEY = "jarlet:draft-jar";

export type DraftJar = {
  title: string;
  recipientName: string;
  prompt: string;
  sealMode: SealMode;
  sealDate: string;
  sealLetterCount: string;
};

export const emptyDraftJar: DraftJar = {
  title: "",
  recipientName: "",
  prompt: "",
  sealMode: "manual",
  sealDate: "",
  sealLetterCount: "",
};

export function isSealMode(value: string): value is SealMode {
  return value === "manual" || value === "date" || value === "count";
}

export function draftJarFromFormData(formData: FormData): DraftJar {
  const sealModeRaw = String(formData.get("sealMode") ?? "manual");
  return {
    title: String(formData.get("title") ?? ""),
    recipientName: String(formData.get("recipientName") ?? ""),
    prompt: String(formData.get("prompt") ?? ""),
    sealMode: isSealMode(sealModeRaw) ? sealModeRaw : "manual",
    sealDate: String(formData.get("sealDate") ?? ""),
    sealLetterCount: String(formData.get("sealLetterCount") ?? ""),
  };
}

function parseDraft(raw: unknown): DraftJar | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const sealMode =
    typeof value.sealMode === "string" && isSealMode(value.sealMode)
      ? value.sealMode
      : "manual";
  return {
    title: typeof value.title === "string" ? value.title : "",
    recipientName:
      typeof value.recipientName === "string" ? value.recipientName : "",
    prompt: typeof value.prompt === "string" ? value.prompt : "",
    sealMode,
    sealDate: typeof value.sealDate === "string" ? value.sealDate : "",
    sealLetterCount:
      typeof value.sealLetterCount === "string" ? value.sealLetterCount : "",
  };
}

let snapshotRaw: string | null = null;
let snapshot: DraftJar | null = null;
let snapshotReady = false;

/** Cached snapshot for useSyncExternalStore — same reference if storage is unchanged. */
export function getDraftJarSnapshot(): DraftJar | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRAFT_JAR_KEY);
  if (snapshotReady && raw === snapshotRaw) return snapshot;
  snapshotReady = true;
  snapshotRaw = raw;
  if (!raw) {
    snapshot = null;
    return snapshot;
  }
  try {
    snapshot = parseDraft(JSON.parse(raw));
  } catch {
    snapshot = null;
  }
  return snapshot;
}

export function readDraftJar(): DraftJar | null {
  return getDraftJarSnapshot();
}

export function writeDraftJar(draft: DraftJar): void {
  const raw = JSON.stringify(draft);
  window.localStorage.setItem(DRAFT_JAR_KEY, raw);
  snapshotRaw = raw;
  snapshot = draft;
  snapshotReady = true;
}

export function clearDraftJar(): void {
  window.localStorage.removeItem(DRAFT_JAR_KEY);
  snapshotRaw = null;
  snapshot = null;
  snapshotReady = true;
}

export function subscribeDraftJar(onStoreChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === DRAFT_JAR_KEY || event.key === null) {
      snapshotReady = false;
      onStoreChange();
    }
  }
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
