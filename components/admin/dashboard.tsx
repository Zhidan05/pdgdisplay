"use client";
import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  CalendarDays,
  ImageIcon,
  Radio,
  Settings2,
  Tv,
} from "lucide-react";
import { useBoardData } from "@/lib/supabase-provider";
import { useClock } from "@/lib/use-clock";
import { hasStream, todaySchedules } from "@/lib/broadcast";
import { PageHeading, StatCard } from "./admin-ui";
import { StationStatusCard } from "./station-status-card";
import { RunningTicker } from "@/components/board/running-ticker";
const actions = [
  {
    title: "Update Streaming",
    detail: "Kelola sumber siaran",
    href: "streaming",
    icon: Tv,
  },
  {
    title: "Jadwal Program",
    detail: "Susun agenda siaran",
    href: "schedules",
    icon: CalendarDays,
  },
  {
    title: "Kelola Info Terbaru",
    detail: "Poster & informasi publik",
    href: "info",
    icon: ImageIcon,
  },
  {
    title: "Running Text",
    detail: "Perbarui pesan berjalan",
    href: "running-text",
    icon: AudioLines,
  },
  {
    title: "Pengaturan",
    detail: "Identitas & tampilan board",
    href: "settings",
    icon: Settings2,
  },
];
export function Dashboard() {
  const data = useBoardData();
  const now = useClock();
  const active = data.stations.filter((s) => hasStream(s.streamUrl)).length;
  return (
    <>
      <PageHeading
        title="Selamat datang di ruang kendali."
        description="Pantau siaran dan kelola informasi RRI Padang dalam satu tempat."
      />
      <div className="stats-grid">
        <StatCard
          label="STATUS SIARAN"
          value={`${active} / 3`}
          detail="Saluran dengan stream URL"
          icon={Radio}
          accent="green"
        />
        <StatCard
          label="JADWAL HARI INI"
          value={
            todaySchedules(data.schedules, now, data.settings.timezone).length
          }
          detail="Program di seluruh saluran"
          icon={CalendarDays}
        />
        <StatCard
          label="INFO TERBARU"
          value={data.info.length}
          detail={`${data.info.filter((i) => i.display_type === "main_poster").length} poster utama · ${data.info.filter((i) => i.display_type === "latest_info").length} info carousel`}
          icon={ImageIcon}
          accent="orange"
        />
        <StatCard
          label="STREAM AKTIF"
          value={active}
          detail="Ketersediaan berdasarkan URL"
          icon={Tv}
        />
      </div>
      <div className="admin-section-heading">
        <h2>
          <Radio size={21} />
          Status kanal siaran
        </h2>
        <Link href="/admin/broadcast-status">
          Lihat monitoring <ArrowRight size={15} />
        </Link>
      </div>
      <div className="station-grid">
        {data.stations.map((station) => (
          <StationStatusCard
            key={station.id}
            station={station}
            schedules={data.schedules}
            settings={data.settings}
            now={now}
          />
        ))}
      </div>
      <div className="admin-section-heading">
        <h2>Akses cepat</h2>
        <span>Kelola tampilan publik Anda</span>
      </div>
      <div className="quick-actions">
        {actions.map(({ title, detail, href, icon: Icon }) => (
          <Link key={href} href={`/admin/${href}`} className="panel">
            <Icon size={23} />
            <strong>{title}</strong>
            <span>{detail}</span>
          </Link>
        ))}
      </div>
      <div className="admin-section-heading">
        <h2>
          <AudioLines size={20} />
          Pratinjau running text
        </h2>
        <Link href="/admin/running-text">
          Kelola pesan <ArrowRight size={15} />
        </Link>
      </div>
      <div className="ticker-preview">
        <RunningTicker items={data.ticker} />
      </div>
    </>
  );
}
export function BroadcastMonitor() {
  const data = useBoardData();
  const now = useClock();
  return (
    <>
      <PageHeading
        title="Status siaran"
        description="Monitoring otomatis berdasarkan ketersediaan stream URL. Halaman ini hanya untuk pemantauan."
      />
      <div className="monitor-banner">
        <Radio size={19} />
        <span>Status diperbarui ketika konfigurasi streaming berubah.</span>
        <span className="ml-auto">READ ONLY</span>
      </div>
      <div className="station-grid">
        {data.stations.map((station) => (
          <StationStatusCard
            key={station.id}
            station={station}
            schedules={data.schedules}
            settings={data.settings}
            now={now}
            monitoring
          />
        ))}
      </div>
    </>
  );
}
