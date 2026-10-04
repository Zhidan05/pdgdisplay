export type PrayerName = "Subuh" | "Dzuhur" | "Ashar" | "Maghrib" | "Isya";

export type NextPrayer = {
  name: PrayerName;
  time: Date;
};

// Represents a full day's schedule from API
export type DailyPrayer = {
  tanggal: number;
  tanggal_lengkap: string; // e.g. "2026-10-01"
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
};

// In-memory cache
const prayerCache = new Map<string, DailyPrayer>();
let isFetching = false;
const fetchQueue: Array<(schedule: DailyPrayer | null) => void> = [];

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
  
  const parts = formatter.formatToParts(now);
  const p = {} as Record<string, string>;
  for (const part of parts) {
    if (part.type !== "literal") {
      p[part.type] = part.value;
    }
  }
  
  return new Date(
    parseInt(p.year, 10),
    parseInt(p.month, 10) - 1,
    parseInt(p.day, 10),
    parseInt(p.hour, 10) % 24,
    parseInt(p.minute, 10),
    parseInt(p.second, 10)
  );
}

// YYYY-MM-DD in local Jakarta time
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parses "HH:mm" to a Date object matching the given local Jakarta date
function parsePrayerTime(date: Date, timeStr: string): Date {
  const [hh, mm] = timeStr.split(":").map(Number);
  const result = new Date(date.getTime());
  result.setHours(hh, mm, 0, 0);
  return result;
}

export async function fetchMonthlySchedule(year: number, month: number): Promise<void> {
  try {
    const res = await fetch("https://equran.id/api/v2/shalat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provinsi: "Sumatera Barat",
        kabkota: "Kota Padang",
        bulan: month,
        tahun: year,
      }),
    });
    
    if (!res.ok) throw new Error("API request failed");
    
    const json = await res.json();
    if (json.data && json.data.jadwal && Array.isArray(json.data.jadwal)) {
      json.data.jadwal.forEach((day: DailyPrayer) => {
        const key = `prayer_schedule_${day.tanggal_lengkap}`;
        prayerCache.set(key, day);
      });
    }
  } catch (err) {
    console.error("Failed to fetch equran prayer schedule:", err);
  }
}

export async function getScheduleForDate(date: Date): Promise<DailyPrayer | null> {
  const key = `prayer_schedule_${formatDateKey(date)}`;
  if (prayerCache.has(key)) {
    return prayerCache.get(key)!;
  }
  
  if (isFetching) {
    return new Promise((resolve) => {
      fetchQueue.push(resolve);
    });
  }
  
  isFetching = true;
  await fetchMonthlySchedule(date.getFullYear(), date.getMonth() + 1);
  isFetching = false;
  
  const schedule = prayerCache.get(key) || null;
  
  while (fetchQueue.length > 0) {
    const resolve = fetchQueue.shift();
    if (resolve) resolve(schedule);
  }
  
  return schedule;
}

export async function getNextPrayerAsync(now: Date = new Date()): Promise<NextPrayer | null> {
  const jakartaNow = getJakartaDate(now);
  let schedule = await getScheduleForDate(jakartaNow);
  
  if (!schedule) {
    return null; // fallback gracefully if API fails completely
  }
  
  const prayers: { name: PrayerName; timeStr: string }[] = [
    { name: "Subuh", timeStr: schedule.subuh },
    { name: "Dzuhur", timeStr: schedule.dzuhur },
    { name: "Ashar", timeStr: schedule.ashar },
    { name: "Maghrib", timeStr: schedule.maghrib },
    { name: "Isya", timeStr: schedule.isya },
  ];

  for (const prayer of prayers) {
    const time = parsePrayerTime(jakartaNow, prayer.timeStr);
    if (time.getTime() > jakartaNow.getTime()) {
      return { name: prayer.name, time };
    }
  }

  // If no more prayers today (after Isya), get Subuh for tomorrow
  const tomorrow = new Date(jakartaNow.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowSchedule = await getScheduleForDate(tomorrow);
  
  if (tomorrowSchedule) {
    return {
      name: "Subuh",
      time: parsePrayerTime(tomorrow, tomorrowSchedule.subuh),
    };
  }
  
  return null;
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
