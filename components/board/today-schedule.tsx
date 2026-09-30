import { CalendarDays, Mic2 } from "lucide-react";
import {
  BroadcastStatus,
  ChannelBadge,
  ChannelLogo,
  EmptyState,
} from "@/components/shared/broadcast-ui";
import { hasStream, isCurrent, todaySchedules } from "@/lib/broadcast";
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
export function TodaySchedule({
  schedules,
  station,
  stations,
  now,
  timezone,
}: {
  schedules: Schedule[];
  station: Station;
  stations: Station[];
  now: Date | null;
  timezone: string;
}) {
  const items = todaySchedules(
    schedules.filter((s) => s.channel === station.id),
    now,
    timezone,
  );
  const currentIndex = items.findIndex((s) => isCurrent(s, now, timezone));
  const visible =
    currentIndex > 0
      ? [...items.slice(currentIndex), ...items.slice(0, currentIndex)]
      : items;
  return (
    <section className="today-schedule panel">
      <div className="section-heading">
        <h2>
          <CalendarDays size={19} />
          JADWAL HARI INI
        </h2>
      </div>
      <div className="schedule-subtitle">
        <span>
          {now
            ? now.toLocaleDateString("id-ID", {
                timeZone: timezone,
                weekday: "long",
                day: "numeric",
                month: "short",
              })
            : "Jadwal harian"}
        </span>
        <span>{station.frequency}</span>
      </div>
      <div className="schedule-list">
        {visible.length ? (
          visible.map((item) => (
            <ScheduleItem
              key={item.id}
              item={item}
              current={isCurrent(item, now, timezone)}
              available={hasStream(station.streamUrl)}
            />
          ))
        ) : (
          <EmptyState>Belum ada jadwal hari ini.</EmptyState>
        )}
      </div>
      <div className="station-frequencies">
        <span>FREKUENSI RRI PADANG</span>
        <div>
          {stations.map((s) => (
            <div key={s.id}>
              <ChannelLogo channel={s.id} />
              <small>{s.frequency}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
