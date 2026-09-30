import Image from "next/image";
import { Radio } from "lucide-react";
import type { ChannelId } from "@/data/types";
import { channelName } from "@/lib/broadcast";

export const channelAssets: Record<ChannelId, { logo: string; frequency: string }> = {
  pro1: { logo: "/rri/pro1.png", frequency: "95.9 FM" },
  pro2: { logo: "/rri/pro2.png", frequency: "90.8 FM" },
  pro4: { logo: "/rri/pro4.png", frequency: "92.4 FM" },
};

export function RriBrand({
  compact = false,
  name = "RRI PADANG",
  subtitle = "Radio Republik Indonesia",
}: {
  compact?: boolean;
  name?: string;
  subtitle?: string;
}) {
  return (
    <div className={`rri-brand ${compact ? "compact" : ""}`}>
      <div className="rri-logo-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "48px" }}>
        <Image
          src="/rri/rri.png"
          alt="Radio Republik Indonesia"
          width={154}
          height={48}
          priority
          className="brand-logo"
          style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      </div>
      <div className="brand-type">
        <strong>{name}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
export function ChannelBadge({ channel }: { channel: ChannelId }) {
  return (
    <span className={`channel-badge ${channel}`}>{channelName(channel)}</span>
  );
}
export function ChannelLogo({ channel, showFrequency }: { channel: ChannelId; showFrequency?: boolean }) {
  const asset = channelAssets[channel];
  return (
    <div className={`channel-identity ${channel}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <div className="channel-logo-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "32px" }}>
        <Image
          src={asset.logo}
          alt={channelName(channel)}
          width={120}
          height={48}
          className="channel-img"
          style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      </div>
      {showFrequency && <small className="channel-freq" style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>{asset.frequency}</small>}
    </div>
  );
}
export function BroadcastStatus({ available }: { available: boolean }) {
  return (
    <span className={`broadcast-status ${available ? "on" : "off"}`}>
      <i />
      {available ? "ON AIR" : "OFF AIR"}
    </span>
  );
}
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <Radio size={26} />
      <p>{children}</p>
    </div>
  );
}
