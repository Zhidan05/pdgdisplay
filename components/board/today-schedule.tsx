import { CalendarDays, Mic2 } from "lucide-react";
import {
  BroadcastStatus,
  ChannelBadge,
} from "@/components/shared/broadcast-ui";
import { hasStream, isCurrent, todaySchedules, timeParts, minutes } from "@/lib/broadcast";
import type { Schedule, Station } from "@/data/types";

export function ScheduleItem({
  item,
  current,
  available,
}: {
  item: Schedule;
  current: boolean;
  available: boolean;
}) {
  return (
    <article className={`schedule-item ${current ? "current" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <time>
          {item.start} – {item.end}
        </time>
        <ChannelBadge channel={item.channel} />
      </div>
      <h3>{item.program}</h3>
      {item.presenter && (
        <p>
          <Mic2 size={12} />
          {item.presenter}
        </p>
      )}
      {current && (
        <div className="schedule-now">
          <span>PROGRAM SAAT INI</span>
          {available && <BroadcastStatus available />}
        </div>
      )}
    </article>
  );
}
const CHANNEL_COLORS: Record<string, { accent: string; soft: string; muted: string; ring: string }> = {
  pro1: {
    accent: "#ff7a00",
    soft: "rgba(255, 122, 0, 0.15)",
    muted: "rgba(255, 122, 0, 0.4)",
    ring: "rgba(255, 122, 0, 0.5)",
  },
  pro2: {
    accent: "#19b5e8",
    soft: "rgba(25, 181, 232, 0.15)",
    muted: "rgba(25, 181, 232, 0.4)",
    ring: "rgba(25, 181, 232, 0.5)",
  },
  pro3: {
    accent: "#ef4444",
    soft: "rgba(239, 68, 68, 0.15)",
    muted: "rgba(239, 68, 68, 0.4)",
    ring: "rgba(239, 68, 68, 0.5)",
  },
  pro4: {
    accent: "#24c77b",
    soft: "rgba(36, 199, 123, 0.15)",
    muted: "rgba(36, 199, 123, 0.4)",
    ring: "rgba(36, 199, 123, 0.5)",
  },
};

export function TodaySchedule({
  schedules,
  stations,
  now,
  timezone,
}: {
  schedules: Schedule[];
  stations: Station[];
  now: Date | null;
  timezone: string;
}) {
  return (
    <section className="today-schedule panel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div className="section-heading">
        <h2>
          <CalendarDays size={19} />
          JADWAL HARI INI
        </h2>
      </div>
      <div className="schedule-subtitle" style={{ marginBottom: "0" }}>
        <span>
          {now
            ? now.toLocaleDateString("id-ID", {
                timeZone: timezone,
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Jadwal harian"}
        </span>
      </div>
      <div className="all-schedules" style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, overflow: "hidden" }}>
        {stations.map(st => {
          const items = todaySchedules(
            schedules.filter((s) => s.channel === st.id),
            now,
            timezone,
          );
          const currentIndex = items.findIndex((s) => isCurrent(s, now, timezone));
          
          let visible: Schedule[] = [];
          if (currentIndex >= 0) {
            visible = [items[currentIndex]];
            if (items.length > 1) {
              visible.push(items[(currentIndex + 1) % items.length]);
            }
          } else if (items.length > 0) {
             const currentTimeInMinutes = now ? timeParts(now, timezone).minutes : 0;
             const upcoming = items.filter(i => minutes(i.start) >= currentTimeInMinutes);
             if (upcoming.length > 0) {
               visible = upcoming.slice(0, 2);
             } else {
               visible = items.slice(0, 2);
             }
          }
          
          if (visible.length === 0) return null;
          
          const theme = CHANNEL_COLORS[st.id] || CHANNEL_COLORS.pro1;
          
          return (
            <div 
              key={st.id} 
              className="channel-schedule-group" 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "0",
                "--accent": theme.accent,
                "--accent-soft": theme.soft,
                "--accent-muted": theme.muted,
                "--ring": theme.ring,
              } as React.CSSProperties}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "2px solid var(--border-subtle)", paddingBottom: "8px", marginBottom: "4px", paddingLeft: "4px" }}>
                <img
                  src={`/rri/${st.id}.png`}
                  alt={`RRI ${st.id}`}
                  className="schedule-channel-logo"
                  style={{ height: "24px", width: "auto", objectFit: "contain" }}
                />
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: "1px" }}>{st.frequency}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {visible.map(item => (
                  <ScheduleItem
                    key={item.id}
                    item={item}
                    current={isCurrent(item, now, timezone)}
                    available={hasStream(st.streamUrl)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
