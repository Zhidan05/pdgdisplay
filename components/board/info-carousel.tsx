"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ASPECT_RATIOS, type InfoItem } from "@/data/types";
import { normalizeInfoAspectRatio } from "@/lib/board/mapper";
import { formatDate } from "@/lib/broadcast";
import { useBoardData } from "@/lib/supabase-provider";
import { EmptyState } from "@/components/shared/broadcast-ui";
import { MediaImage } from "@/components/shared/media-image";

function useCarousel(length: number, delay: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const validDelay = (Number.isFinite(delay) && delay > 0) ? delay : 10000;
    if (length < 2 || paused) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % length), validDelay);
    return () => clearTimeout(timer);
  }, [length, delay, paused, index]);
  return {
    index: length ? index % length : 0,
    select: setIndex,
    paused,
    toggle: () => setPaused((p) => !p),
  };
}
export function LatestInfoCard({ item }: { item: InfoItem }) {
  const safeRatio = normalizeInfoAspectRatio(item.ratio);
  const ratioConfig = ASPECT_RATIOS[safeRatio];
  const ratioValue = ratioConfig ? ratioConfig.value : 0.8;
  
  return (
    <article
      className={`latest-info-card ${ratioValue < 1 ? "portrait" : "landscape"}`}
      data-ratio={safeRatio}
    >
      <div className="info-image" style={{ aspectRatio: ratioValue }}>
        <MediaImage
          key={item.image}
          src={item.image}
          alt={item.title}
          className={item.display_type === "main_poster" ? "artwork" : ""}
        />
      </div>
      <div className="info-copy">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <time dateTime={item.date}>{formatDate(item.date)}</time>
      </div>
    </article>
  );
}
export function LatestInfoCarousel({ items }: { items: InfoItem[] }) {
  const { settings } = useBoardData();
  const { index, select, paused, toggle } = useCarousel(items.length, settings.infoInterval * 1000);
  return (
    <section
      className="latest-info panel"
      aria-label="Info Terbaru"
      aria-roledescription="carousel"
    >
      <div className="section-heading">
        <h2>
          <i />
          INFO TERBARU
        </h2>
        <div className="carousel-controls">
          <button
            className="icon-button"
            onClick={toggle}
            aria-label={paused ? "Putar info" : "Jeda info"}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <span>
            {items.length ? String(index + 1).padStart(2, "0") : "00"}
            <b> / {String(items.length).padStart(2, "0")}</b>
          </span>
          <button
            className="icon-button"
            aria-label="Info sebelumnya"
            disabled={items.length < 2}
            onClick={() => select((index - 1 + items.length) % items.length)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Info berikutnya"
            disabled={items.length < 2}
            onClick={() => select((index + 1) % items.length)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {items.length ? (
        <LatestInfoCard key={items[index].id} item={items[index]} />
      ) : (
        <EmptyState>Belum ada informasi terbaru.</EmptyState>
      )}
      <div className="info-progress" aria-hidden="true">
        {items.map((item, i) => (
          <span key={item.id} className={i === index ? "active" : ""} />
        ))}
      </div>
    </section>
  );
}
export function MainPoster({ items }: { items: InfoItem[] }) {
  const { settings } = useBoardData();
  const { index, select, paused, toggle } = useCarousel(items.length, settings.mainImageInterval * 1000);
  
  return (
    <section
      className="main-poster panel"
      aria-label="Gambar Utama"
      aria-roledescription="carousel"
    >
      {items.length ? (
        <div className="main-image-frame" style={{ position: "relative" }}>
          {items.map((item, i) => (
             <div 
               key={item.image} 
               style={{ 
                 position: "absolute", 
                 inset: 0,
                 opacity: i === index ? 1 : 0, 
                 transition: "opacity 500ms ease-in-out",
                 zIndex: i === index ? 1 : 0
               }}
             >
               <MediaImage
                 src={item.image}
                 alt={item.title || "Gambar Utama"}
                 priority={i === index || i === (index + 1) % items.length}
                 className="main-image-content"
               />
             </div>
          ))}
        </div>
      ) : (
        <div className="main-image-frame" style={{ position: "relative" }}>
           <MediaImage
             src={settings.fallbackImage}
             alt="Gambar Utama Fallback"
             priority
             className="main-image-content"
           />
        </div>
      )}
      {items.length > 1 && (
        <div className="poster-dots">
          <button
            className="icon-button"
            onClick={toggle}
            aria-label={paused ? "Putar gambar" : "Jeda gambar"}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          {items.map((item, i) => (
            <button
              key={item.id}
              aria-label={`Gambar ${i + 1}`}
              aria-pressed={i === index}
              className={i === index ? "active" : ""}
              onClick={() => select(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
