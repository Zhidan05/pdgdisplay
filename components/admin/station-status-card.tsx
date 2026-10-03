import Link from "next/link";
import { ArrowUpRight, Clock3, Mic2 } from "lucide-react";
import {
  BroadcastStatus,
  ChannelLogo,
} from "@/components/shared/broadcast-ui";
import { MediaImage } from "@/components/shared/media-image";
import { hasStream, isCurrent, todaySchedules } from "@/lib/broadcast";
import { getStreamSource } from "@/lib/media-utils";
import type { Schedule, Settings, Station } from "@/data/types";
export function StationStatusCard({
  station,
  schedules,
  settings,
  now,
  monitoring = false,
}: {
  station: Station;
  schedules: Schedule[];
  settings: Settings;
  now: Date | null;
  monitoring?: boolean;
}) {
  const available = hasStream(station.streamUrl);
  const programs = todaySchedules(
    schedules.filter((s) => s.channel === station.id),
    now,
    settings.timezone,
  );
  const index = programs.findIndex((s) => isCurrent(s, now, settings.timezone));
  const current = programs[index];
  const next = index >= 0 ? programs[index + 1] : undefined;
  const source = available ? getStreamSource(station.streamUrl!) : null;

  return (
    <article className={`station-status-card panel ${station.id}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ChannelLogo channel={station.id} />
          <span className="frequency">{station.frequency}</span>
        </div>
        <BroadcastStatus available={available} />
      </div>
      <p className="station-tagline">{station.tagline}</p>
      <div className="station-preview">
        {!available && settings.fallbackImage && !settings.fallbackImage.includes("studio.jpg") ? (
          <MediaImage
            key={settings.fallbackImage}
            src={settings.fallbackImage}
            alt="Gedung RRI Padang"
          />
        ) : source?.type === "youtube" ? (
          <img 
            src={`https://img.youtube.com/vi/${source.videoId}/hqdefault.jpg`}
            alt="YouTube Stream Preview"
            className="w-full h-full object-cover"
          />
        ) : source?.type === "audio" ? (
          <div className="w-full h-full bg-[#020c17] flex flex-col items-center justify-center text-text-muted gap-2">
            <span className="material-symbols-outlined text-4xl">radio</span>
            <span className="text-xs">STREAMING AUDIO RRI</span>
          </div>
        ) : source?.type === "video" || source?.type === "unknown" ? (
           <div className="w-full h-full bg-[#020c17] flex flex-col items-center justify-center text-text-muted gap-2">
             <span className="material-symbols-outlined text-4xl">play_circle</span>
             <span className="text-xs">SUMBER VIDEO</span>
           </div>
        ) : (
          <div className="w-full h-full bg-[#020c17] flex flex-col items-center justify-center text-text-muted gap-2">
             <span className="material-symbols-outlined text-4xl">broken_image</span>
             <span className="text-xs">PRATINJAU TIDAK TERSEDIA</span>
          </div>
        )}
        <span>{available ? (source?.type === "youtube" ? "YOUTUBE TERSEDIA" : source?.type === "audio" ? "AUDIO RRI TERSEDIA" : "SUMBER TERSEDIA") : "FALLBACK AKTIF"}</span>
      </div>
      <div className="station-current">
        <div className="flex justify-between gap-2">
          <span>{available ? "PROGRAM SAAT INI" : "JADWAL SAAT INI"}</span>
          <time>{current ? `${current.start}–${current.end}` : "—"}</time>
        </div>
        <h3>{current?.program ?? "Belum ada program saat ini"}</h3>
        {current?.presenter && (
          <p>
            <Mic2 size={13} />
            {current.presenter}
          </p>
        )}
      </div>
      <div className="station-next">
        <Clock3 size={16} />
        <div>
          <span>
            {next ? `BERIKUTNYA · ${next.start}` : "JADWAL BERIKUTNYA"}
          </span>
          <strong>{next?.program ?? "Lihat Jadwal Program"}</strong>
        </div>
      </div>
      {monitoring ? (
        <div className="monitor-detail">
          <span>
            {available ? "Stream URL tersedia" : "Belum ada stream URL"}
          </span>
          <code>{station.streamUrl || "Gambar fallback ditampilkan"}</code>
          <small>Status otomatis berdasarkan konfigurasi URL.</small>
        </div>
      ) : (
        <Link className="station-link" href="/admin/streaming">
          Pengaturan streaming <ArrowUpRight size={16} />
        </Link>
      )}
    </article>
  );
}
