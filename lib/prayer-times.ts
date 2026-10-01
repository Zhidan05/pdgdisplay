import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from "adhan";

export const RRI_PADANG_COORDINATES = {
  latitude: -0.9471,
  longitude: 100.4172,
};

export type PrayerName = "Subuh" | "Dzuhur" | "Ashar" | "Maghrib" | "Isya";

export type NextPrayer = {
  name: PrayerName;
  time: Date;
};

// Use Muslim World League as default calculation parameters.
// This is a common standard, though Kemenag often uses Makkah or MWL with tweaks.
// We explicitly specify our parameters here so it's documented.
export function getCalculationParameters() {
  const params = CalculationMethod.MuslimWorldLeague();
  // Typically Ashar follows Shafi'i madhab in Indonesia
  params.madhab = "shafi";
  return params;
}

// Helper to get a Date object whose local components (getFullYear, etc) match the actual date in WIB
export function getJakartaDate(now: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  // Note: we want the Date's *local* values to match the Jakarta wall time, 
  // so adhan extracts the correct year, month, and day.
  const parts = formatter.formatToParts(now);
  const p = {} as Record<string, string>;
  for (const part of parts) {
    if (part.type !== "literal") {
      p[part.type] = part.value;
    }
  }
  // Create a local date using the extracted values
  return new Date(
    parseInt(p.year, 10),
    parseInt(p.month, 10) - 1,
    parseInt(p.day, 10),
    parseInt(p.hour, 10) % 24,
    parseInt(p.minute, 10),
    parseInt(p.second, 10)
  );
}

export function getPrayerTimes(date: Date = new Date()): PrayerTimes {
  const jakartaDate = getJakartaDate(date);
  const coordinates = new Coordinates(
    RRI_PADANG_COORDINATES.latitude,
    RRI_PADANG_COORDINATES.longitude
  );
  return new PrayerTimes(coordinates, jakartaDate, getCalculationParameters());
}

export function getNextPrayer(now: Date = new Date()): NextPrayer {
  const todayTimes = getPrayerTimes(now);
  
  const prayers: { name: PrayerName; time: Date }[] = [
    { name: "Subuh", time: todayTimes.fajr },
    { name: "Dzuhur", time: todayTimes.dhuhr },
    { name: "Ashar", time: todayTimes.asr },
    { name: "Maghrib", time: todayTimes.maghrib },
    { name: "Isya", time: todayTimes.isha },
  ];

  for (const prayer of prayers) {
    if (prayer.time.getTime() > now.getTime()) {
      return prayer;
    }
  }

  // If no more prayers today (after Isya), get Subuh for tomorrow
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowTimes = getPrayerTimes(tomorrow);
  
  return {
    name: "Subuh",
    time: tomorrowTimes.fajr,
  };
}

export function calculateCountdown(target: Date, now: Date): string {
  let diffMs = target.getTime() - now.getTime();
  if (diffMs < 0) diffMs = 0;

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
