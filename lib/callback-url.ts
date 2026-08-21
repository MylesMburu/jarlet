const FALLBACK = "/dashboard";

/** Same-origin relative paths only — rejects protocol-relative and absolute URLs. */
export function sanitizeCallbackUrl(raw: unknown, fallback = FALLBACK): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || value.length === 0) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  if (value.includes("\\")) return fallback;
  const path = value.split("?")[0];
  if (path === "/auth/signin" || path.startsWith("/auth/signin/")) return fallback;
  return value;
}

export function signInUrl(callbackUrl: string): string {
  const safe = sanitizeCallbackUrl(callbackUrl);
  return `/auth/signin?callbackUrl=${encodeURIComponent(safe)}`;
}
