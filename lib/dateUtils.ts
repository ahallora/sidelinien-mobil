/**
 * Formats a date relatively in Danish (e.g., "10 sekunder siden", "5 minutter siden").
 */
export function formatRelativeDanish(
  date: Date | string | number | null,
): string {
  if (!date) return "";

  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // If less than 5 seconds, just say "Lige nu"
  if (diffInSeconds < 5) return "Lige nu";

  const rtf = new Intl.RelativeTimeFormat("da-DK", { numeric: "always" });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, "minute");
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, "hour");
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return rtf.format(-diffInDays, "day");
  }

  // For older dates, use a regular date format
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
