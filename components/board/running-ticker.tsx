import { AudioLines } from "lucide-react";
import type { CSSProperties } from "react";
import type { TickerItem } from "@/data/types";
export function RunningTicker({ items }: { items: TickerItem[] }) {
  const active = items
    .filter((i) => i.active)
    .sort((a, b) => a.order - b.order);
  const duration = Math.max(
    35,
    active.reduce((sum, item) => sum + item.text.length, 0) / 8,
  );
  return (
    <footer className="running-ticker" aria-label="Informasi terkini">
      <div className="ticker-label">
        <AudioLines size={18} />
        INFO TERKINI
      </div>
      <div className="ticker-window">
        <div
          className="ticker-track"
          style={{ "--ticker-duration": `${duration}s` } as CSSProperties}
        >
          {[0, 1].map((copy) => (
            <div className="ticker-copy" key={copy} aria-hidden={copy === 1}>
              {active.length ? (
                active.map((item) => (
                  <span key={item.id}>
                    {item.text}
                    <b>|</b>
                  </span>
                ))
              ) : (
                <span>
                  RRI Padang — Sekali di udara, tetap di udara.<b>|</b>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="ticker-signature">
        RRI <span>PADANG</span>
      </div>
    </footer>
  );
}
