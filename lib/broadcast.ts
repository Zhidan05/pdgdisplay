import type { Schedule } from "@/data/types";
import { isScheduleActiveNow } from "./board/schedule-utils";
export const channelName = (id: string) => id.replace("pro", "PRO ");
export const hasStream = (url: string | null | undefined) => Boolean(url?.trim());

export function parseYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([^#&?]*).*/);
  return match && match[1].length === 11 ? match[1] : null;
}

export function isAudioStreamUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.endsWith(".mp3") ||
    lower.endsWith(".aac") ||
    lower.endsWith(".m4a") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".oga") ||
    lower.endsWith(".wav") ||
    lower.includes("streaming.rri.go.id") ||
    lower.includes("rripadang") ||
    lower.includes(".mp3?") ||
    lower.includes(".aac?") ||
    lower.includes("/audio") ||
    lower.includes("icecast") ||
    lower.includes("shoutcast")
  );
}

export function isVideoStreamUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".m3u8") ||
    lower.includes("/video") ||
    lower.includes("/media/")
  );
}

export function validMediaUrl(value: string) {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (value.includes("youtube.com/") || value.includes("youtu.be/")) return true;
  try {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

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
  return isScheduleActiveNow(item.daysOfWeek || [], item.start, item.end, now, timezone);
}

export function todaySchedules(
  items: Schedule[],
  now: Date | null,
  timezone: string,
) {
  if (!now)
    return items
      .filter((s) => (s.daysOfWeek || []).length === 7)
      .sort((a, b) => a.start.localeCompare(b.start));
      
  const dayName = now.toLocaleDateString("en-US", { timeZone: timezone, weekday: "short" });
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const currentDay = map[dayName] || 1;

  return items
    .filter(
      (s) =>
        (s.daysOfWeek || []).includes(currentDay) ||
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


