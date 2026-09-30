"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AudioLines,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  LayoutDashboard,
  Radio,
  Settings2,
  Tv,
  UserRound,
  LogOut
} from "lucide-react";
import { RriBrand } from "@/components/shared/broadcast-ui";
import { useBoardData } from "@/lib/supabase-provider";
import { hasStream } from "@/lib/broadcast";
import { useClock } from "@/lib/use-clock";
import { createClient } from "@/util/supabase/client";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/streaming", label: "Streaming", icon: Tv },
  { href: "/admin/schedules", label: "Jadwal Program", icon: CalendarDays },
  { href: "/admin/info", label: "Info Terbaru", icon: ImageIcon },
  { href: "/admin/main-images", label: "Gambar Utama", icon: ImageIcon },
  { href: "/admin/broadcast-status", label: "Status Siaran", icon: Radio },
  { href: "/admin/running-text", label: "Running Text", icon: AudioLines },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { settings, stations } = useBoardData();
  const now = useClock();
  const active = stations.filter((s) => hasStream(s.streamUrl)).length;
  
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };
  
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <RriBrand
          compact
          name={settings.stationName}
          subtitle="BROADCAST ADMIN"
        />
        <div className="sidebar-label">MENU UTAMA</div>
        <nav aria-label="Navigasi admin">
          {navigation.map(({ href, label, icon: Icon }, i) => (
            <div key={href}>
              {i === 7 && (
                <div className="sidebar-label configuration-label">
                  KONFIGURASI
                </div>
              )}
              <Link
                href={href}
                className={path === href ? "active" : ""}
                aria-current={path === href ? "page" : undefined}
              >
                <Icon size={19} />
                <span>{label}</span>
                {path === href && (
                  <ChevronRight size={15} className="ml-auto" />
                )}
              </Link>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Radio size={22} />
          <strong>Suara Indonesia.</strong>
          <p>Dari Padang, untuk Nusantara.</p>
          <span>SISTEM TERHUBUNG</span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-breadcrumb">
              RRI PADANG <ChevronRight size={13} />
            </span>
            <strong>
              {navigation.find((n) => n.href === path)?.label ?? "Admin"}
            </strong>
          </div>
          <div>
            <span className="text-secondary hidden lg:block">
              {now
                ? now.toLocaleTimeString("en-GB", {
                    timeZone: settings.timezone,
                    hourCycle: "h23",
                  })
                : "--:--:--"}
            </span>
            <span className="active-stream-count">
              <i />
              {active} saluran tersedia
            </span>
            <Link className="button secondary" href="/" target="_blank">
              Lihat Info Board <ExternalLink size={15} />
            </Link>
            <span className="operator-avatar" title="Operator lokal">
              <UserRound size={19} />
            </span>
            <button 
              onClick={handleLogout}
              className="icon-button" 
              title="Keluar"
              style={{ marginLeft: '10px' }}
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer">
          <span>RRI Padang · Konsol Broadcast</span>
          <span>Supabase Integration / Phase 02</span>
        </footer>
      </div>
    </div>
  );
}
