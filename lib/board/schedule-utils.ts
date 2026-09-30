export function normalizeDaysOfWeek(days: number[]): number[] {
  if (!days || !Array.isArray(days)) return [];
  // unique, sorted, only 1-7
  const valid = days.filter((d) => d >= 1 && d <= 7);
  return Array.from(new Set(valid)).sort((a, b) => a - b);
}

export function formatDaysOfWeek(days: number[]): string {
  const norm = normalizeDaysOfWeek(days);
  if (norm.length === 0) return "Tidak ada hari";
  
  if (norm.length === 7) return "Setiap Hari";
  if (norm.length === 2 && norm[0] === 6 && norm[1] === 7) return "Akhir Pekan";
  if (norm.length === 5 && norm[0] === 1 && norm[1] === 2 && norm[2] === 3 && norm[3] === 4 && norm[4] === 5) return "Senin–Jumat";

  // Check contiguous
  let contiguous = true;
  for (let i = 1; i < norm.length; i++) {
    if (norm[i] !== norm[i - 1] + 1) {
      contiguous = false;
      break;
    }
  }

  const dayNames = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  if (contiguous && norm.length > 1) {
    return `${dayNames[norm[0]]}–${dayNames[norm[norm.length - 1]]}`;
  }

  return norm.map((d) => dayNames[d]).join(", ");
}

export function isScheduleActiveNow(
  daysOfWeek: number[],
  startStr: string,
  endStr: string,
  nowDate: Date,
  timezone: string
): boolean {
  // Convert now to board timezone day and time
  const dayName = nowDate.toLocaleDateString("en-US", { timeZone: timezone, weekday: "short" });
  const timeStr = nowDate.toLocaleTimeString("en-GB", { timeZone: timezone, hourCycle: "h23" });
  
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const currentDay = map[dayName] || 1;
  
  const prevDay = currentDay === 1 ? 7 : currentDay - 1;

  const start = startStr.substring(0, 5);
  const end = endStr.substring(0, 5);
  
  const isOvernight = start >= end;

  // Normal schedule (start < end)
  if (!isOvernight) {
    if (daysOfWeek.includes(currentDay)) {
      if (timeStr >= start && timeStr < end) return true;
    }
  } else {
    // Overnight schedule (start >= end)
    // If it started today, it is active if timeStr >= start
    if (daysOfWeek.includes(currentDay) && timeStr >= start) return true;
    
    // If it started yesterday, it is active if timeStr < end
    if (daysOfWeek.includes(prevDay) && timeStr < end) return true;
  }
  
  return false;
}

export type ScheduleConflict = {
  id: string;
  title: string;
  stationId: string;
  stationName: string;
  overlappingDays: number[];
  startTime: string;
  endTime: string;
};

// Client-side conflict detection (used before saving)
export function findScheduleConflict(
  schedules: { id: string; channel: string; program: string; daysOfWeek: number[]; start: string; end: string }[],
  newSchedule: { id?: string; channel: string; daysOfWeek: number[]; start: string; end: string; isActive: boolean }
): ScheduleConflict | null {
  if (!newSchedule.isActive) return null;
  
  const normDays = normalizeDaysOfWeek(newSchedule.daysOfWeek);
  if (normDays.length === 0) return null;

  const newStart = newSchedule.start.substring(0, 5);
  const newEnd = newSchedule.end.substring(0, 5);
  const isNewOvernight = newStart >= newEnd;

  // Build physical ranges for new schedule
  const newRanges: { day: number; start: string; end: string }[] = [];
  for (const d of normDays) {
    if (!isNewOvernight) {
      newRanges.push({ day: d, start: newStart, end: newEnd });
    } else {
      newRanges.push({ day: d, start: newStart, end: "24:00" });
      newRanges.push({ day: (d % 7) + 1, start: "00:00", end: newEnd });
    }
  }

  for (const exist of schedules) {
    if (exist.channel !== newSchedule.channel) continue;
    if (exist.id === newSchedule.id) continue; // Exclude itself

    const exDays = normalizeDaysOfWeek(exist.daysOfWeek || []);
    const exStart = (exist.start || "").substring(0, 5);
    const exEnd = (exist.end || "").substring(0, 5);
    const isExOvernight = exStart >= exEnd;

    const existRanges: { day: number; start: string; end: string }[] = [];
    for (const d of exDays) {
      if (!isExOvernight) {
        existRanges.push({ day: d, start: exStart, end: exEnd });
      } else {
        existRanges.push({ day: d, start: exStart, end: "24:00" });
        existRanges.push({ day: (d % 7) + 1, start: "00:00", end: exEnd });
      }
    }

    const overlaps = new Set<number>();
    
    for (const nr of newRanges) {
      for (const er of existRanges) {
        if (nr.day === er.day) {
          if (nr.start < er.end && nr.end > er.start) {
            overlaps.add(nr.day);
          }
        }
      }
    }

    if (overlaps.size > 0) {
      return {
        id: exist.id,
        title: exist.program,
        stationId: exist.channel,
        stationName: exist.channel.toUpperCase(),
        overlappingDays: Array.from(overlaps).sort((a,b)=>a-b),
        startTime: exStart,
        endTime: exEnd
      };
    }
  }

  return null;
}
