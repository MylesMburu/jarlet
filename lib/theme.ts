export type JarStatus = "open" | "sealed" | "delivered";
export type JarTheme = "sealed" | "reveal";

export function jarTheme(status: string): JarTheme {
  return status === "delivered" ? "reveal" : "sealed";
}