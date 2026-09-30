"use client";
import { useState } from "react";
import { AudioLines, Mic2, Radio, VolumeX } from "lucide-react";
import {
  BroadcastStatus,
  ChannelLogo,
} from "@/components/shared/broadcast-ui";
import { MediaImage } from "@/components/shared/media-image";
import { hasStream } from "@/lib/broadcast";
import { getStreamSource } from "@/lib/media-utils";
import type { Schedule, Station } from "@/data/types";

export function OfflineFallback({ image }: { image: string }) {
  return (
    <div className="offline-fallback">
      <MediaImage
        key={image}
        src={image}
        alt="Gedung RRI Padang — referensi visual"
        priority
      />
      <div className="offline-message">
        <Radio size={30} />
        <span>SELALU DEKAT DENGAN ANDA</span>
        <h2>Siaran sedang tidak tersedia</h2>
        <p>
          Kami akan kembali menemani Anda.
          <br />
          Tetap bersama RRI Padang.
        </p>
      </div>
    </div>
  );
}
function StreamMedia({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const source = getStreamSource(url);
  
  return (
    <>
      <MediaImage
        src="/rri/studio.jpg"
        alt="Pratinjau studio siaran RRI Padang"
        priority
      />
      {!failed && source?.type === "youtube" && (
        <iframe
          className="stream-video"
          src={source.embedUrl}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="YouTube Live Stream"
          onError={() => setFailed(true)}
        />
      )}
      {!failed && (source?.type === "video" || source?.type === "unknown") && (
        <video
          className="stream-video"
          src={source.url}
          poster="/rri/studio.jpg"
          autoPlay
          muted
          loop
          playsInline
          controls
          onError={() => setFailed(true)}
          aria-label="Video siaran"
        />
      )}
      {failed && <span className="media-notice">Pratinjau belum tersedia</span>}
    </>
  );
}
export function LiveStreamPanel({
  station,
  current,
  fallbackImage,
  compact = false,
}: {
  station: Station;
  current?: Schedule;
  fallbackImage: string;
  compact?: boolean;
}) {
  const available = hasStream(station.streamUrl);
  return (
    <section
      className={`live-panel panel ${compact ? "compact-live" : ""}`}
      aria-label={`Siaran ${station.id}`}
    >
      <div className="live-media">
        {available ? (
          <StreamMedia key={station.streamUrl} url={station.streamUrl!} />
        ) : (
          <OfflineFallback image={fallbackImage} />
        )}
        <div className="live-top">
          <ChannelLogo channel={station.id} />
          {/* Badge moved to corner of the stream, or keep it here but we want it cleaner */}
          <BroadcastStatus available={available} />
        </div>
        {available && (
          <div className="live-caption">
            <span>
              <AudioLines size={15} />
              {station.streamUrl === "/media/studio-demo.webm"
                ? "PRATINJAU DEMO"
                : "SIARAN LANGSUNG"}
            </span>
            <h2>{current?.program ?? "Bersama RRI Padang"}</h2>
            {current?.presenter && (
              <p>
                <Mic2 size={14} />
                {current.presenter}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="live-footer">
        <span>
          {available ? <AudioLines size={16} /> : <VolumeX size={16} />}
          {station.name} <b>•</b> {station.frequency}
        </span>
        <span>
          {current ? `${current.start}–${current.end}` : "Suara Indonesia"}
        </span>
      </div>
    </section>
  );
}
