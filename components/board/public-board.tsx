"use client";
import { useState } from "react";
import type { ChannelId } from "@/data/types";
import { useBoardData } from "@/lib/supabase-provider";
import { useClock } from "@/lib/use-clock";
import { isCurrent } from "@/lib/broadcast";
import { BroadcastHeader } from "./broadcast-header";
import { LiveStreamPanel } from "./live-stream-panel";
import { LatestInfoCarousel, MainPoster } from "./info-carousel";
import { TodaySchedule } from "./today-schedule";
import { RunningTicker } from "./running-ticker";
import { AudioProvider } from "./audio-context";

const STATION_THEMES = {
  pro1: {
    accent: "#ff7a00",
    accentSoft: "rgba(255, 122, 0, 0.15)",
    accentMuted: "rgba(255, 122, 0, 0.4)",
    ring: "rgba(255, 122, 0, 0.5)",
  },
  pro2: {
    accent: "#19b5e8",
    accentSoft: "rgba(25, 181, 232, 0.15)",
    accentMuted: "rgba(25, 181, 232, 0.4)",
    ring: "rgba(25, 181, 232, 0.5)",
  },
  pro4: {
    accent: "#24c77b",
    accentSoft: "rgba(36, 199, 123, 0.15)",
    accentMuted: "rgba(36, 199, 123, 0.4)",
    ring: "rgba(36, 199, 123, 0.5)",
  },
};

export function PublicBoard() {
  const data = useBoardData();
  const now = useClock();
  const [selected, setSelected] = useState<ChannelId>("pro1");
  const station = data.stations.find((s) => s.id === selected)!;
  const current = data.schedules.find(
    (s) => s.channel === selected && isCurrent(s, now, data.settings.timezone),
  );
  
  const theme = STATION_THEMES[selected] || STATION_THEMES.pro1;
  
  return (
    <AudioProvider>
      <div 
        className="public-board"
        style={{
          "--accent": theme.accent,
          "--accent-soft": theme.accentSoft,
          "--accent-muted": theme.accentMuted,
          "--ring": theme.ring,
        } as React.CSSProperties}
      >
        <BroadcastHeader
          stations={data.stations}
          selected={selected}
          onSelect={setSelected}
          settings={data.settings}
          now={now}
        />
        <main className="main-board-grid">
          <div className="board-left">
            <LiveStreamPanel
              station={station}
              current={current}
              fallbackImage={data.settings.fallbackImage}
            />
            <LatestInfoCarousel
              items={data.info.filter((i) => i.display_type === "latest_info")}
            />
          </div>
          <MainPoster items={data.info.filter((i) => i.display_type === "main_poster" && i.active).sort((a, b) => a.order - b.order)} />
          <TodaySchedule
            schedules={data.schedules}
            stations={data.stations}
            now={now}
            timezone={data.settings.timezone}
          />
        </main>
        <RunningTicker items={data.ticker} />
      </div>
    </AudioProvider>
  );
}
