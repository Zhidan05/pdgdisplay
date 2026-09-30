import type { Schedule } from "@/data/types";
export const channelName = (id: string) => id.replace("pro", "PRO ");
export const hasStream = (url: string | null) => Boolean(url?.trim());
export function timeParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      get("weekday"),
    ),
  };
}
export const minutes = (time: string) =>
  Number(time.split(":")[0]) * 60 + Number(time.split(":")[1]);
export function isCurrent(item: Schedule, now: Date | null, timezone: string) {
  if (!now) return false;
  const { minutes: current, day } = timeParts(now, timezone);
  const start = minutes(item.start),
    end = minutes(item.end);
  const overnight = end < start;
  const matchingDay =
    item.day === "daily" ||
    Number(item.day) === (overnight && current < end ? (day + 6) % 7 : day);
  return (
    matchingDay &&
    (overnight
      ? current >= start || current < end
      : current >= start && current < end)
  );
}
export function todaySchedules(
  items: Schedule[],
  now: Date | null,
  timezone: string,
) {
  if (!now)
    return items
      .filter((s) => s.day === "daily")
      .sort((a, b) => a.start.localeCompare(b.start));
  const { day } = timeParts(now, timezone);
  return items
    .filter(
      (s) =>
        s.day === "daily" ||
        Number(s.day) === day ||
        isCurrent(s, now, timezone),
    )
    .sort((a, b) => a.start.localeCompare(b.start));
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}
export function validMediaUrl(value: string) {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (value.includes("youtube.com/") || value.includes("youtu.be/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
