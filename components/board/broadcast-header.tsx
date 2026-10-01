import Link from "next/link";
import { Maximize, Settings2, Volume2, VolumeX } from "lucide-react";
import { BroadcastStatus, ChannelLogo, RriBrand } from "@/components/shared/broadcast-ui";
import { hasStream } from "@/lib/broadcast";
import { useAudio } from "./audio-context";
import type { ChannelId, Settings, Station } from "@/data/types";

export function BroadcastHeader({
  stations,
  selected,
  onSelect,
  settings,
  now,
}: {
  stations: Station[];
  selected: ChannelId;
  onSelect: (id: ChannelId) => void;
  settings: Settings;
  now: Date | null;
}) {
  const station = stations.find((s) => s.id === selected)!;
  const audio = useAudio();
  
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* Native browser fullscreen remains available. */
    }
  }
  return (
    <header className="broadcast-header">
      <RriBrand 
        name={settings.addressLine1 || "Alamat belum diatur"} 
        subtitle={settings.addressLine2 || "Silakan atur di Pengaturan"} 
      />
      <div className="board-time-container">
        <div className="board-date-block">
          <span className="day-name">
            {now
              ? now.toLocaleDateString("id-ID", {
                  timeZone: settings.timezone,
                  weekday: "long",
                }).toUpperCase()
              : "MEMUAT..."}
          </span>
          <span className="full-date">
            {now
              ? now.toLocaleDateString("id-ID", {
                  timeZone: settings.timezone,
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).toUpperCase()
              : "TANGGAL"}
          </span>
        </div>
        <div className="time-divider" />
        <div className="board-time-block">
          <time>
            {now
              ? now.toLocaleTimeString("en-GB", {
                  timeZone: settings.timezone,
                  hourCycle: "h23",
                })
              : "--:--:--"}
          </time>
          <span className="time-zone">
            {settings.timezone === "Asia/Jakarta"
              ? "WIB"
              : settings.timezone === "Asia/Makassar"
                ? "WITA"
                : settings.timezone === "Asia/Jayapura"
                  ? "WIT"
                  : settings.timezone}
          </span>
        </div>
      </div>
      <div className="header-channels">
        <BroadcastStatus available={hasStream(station.streamUrl)} />
        <nav aria-label="Pilih saluran" className="channel-selector" style={{ gap: "4px" }}>
          {["pro1", "pro2", "pro3", "pro4"].map((ch) => {
            if (ch === "pro3") {
              return (
                <div
                  key={ch}
                  className={`channel-button ${ch}`}
                  aria-label="RRI PRO 3"
                  style={{ cursor: "default" }}
                >
                  <ChannelLogo channel={ch} showFrequency />
                </div>
              );
            }
            return (
              <button
                key={ch}
                className={`channel-button ${ch} ${selected === ch ? "selected" : ""}`}
                aria-pressed={selected === ch}
                onClick={() => onSelect(ch as ChannelId)}
              >
                <ChannelLogo channel={ch} showFrequency />
              </button>
            );
          })}
        </nav>
        <button
          className={`icon-button ${!audio.actualSoundEnabled && audio.autoplayBlocked ? "pulse-warn" : ""}`}
          title={audio.actualSoundEnabled ? "Matikan suara" : "Aktifkan suara"}
          aria-label={audio.actualSoundEnabled ? "Matikan suara" : "Aktifkan suara"}
          onClick={() => {
            if (audio.actualSoundEnabled) {
              audio.setPreferredSoundEnabled(false);
              audio.setActualSoundEnabled(false);
            } else {
              audio.setPreferredSoundEnabled(true);
              audio.retryAudio();
            }
          }}
        >
          {audio.actualSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          className="icon-button"
          title="Layar penuh"
          aria-label="Layar penuh"
          onClick={fullscreen}
        >
          <Maximize size={18} />
        </button>
        <Link
          className="icon-button"
          href="/admin"
          title="Buka admin"
          aria-label="Buka admin"
        >
          <Settings2 size={18} />
        </Link>
      </div>
    </header>
  );
}
