"use client";

import { useEffect, useState, useRef } from "react";
import { getNextPrayerAsync, calculateCountdown, type NextPrayer } from "@/lib/prayer-times";

export function PrayerCountdown() {
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [countdownText, setCountdownText] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  
  // Use ref to keep track of the current prayer without needing to add it to dependency array
  const currentPrayerRef = useRef<NextPrayer | null>(null);

  useEffect(() => {
    setIsMounted(true);
    let timer: ReturnType<typeof setInterval>;

    const init = async () => {
      const currentPrayer = await getNextPrayerAsync(new Date());
      if (!currentPrayer) return;
      
      setNextPrayer(currentPrayer);
      currentPrayerRef.current = currentPrayer;
      setCountdownText(calculateCountdown(currentPrayer.time, new Date()));

      timer = setInterval(async () => {
        const now = new Date();
        const activePrayer = currentPrayerRef.current;
        
        if (activePrayer && now.getTime() >= activePrayer.time.getTime()) {
          // Time passed, get the next one asynchronously
          const next = await getNextPrayerAsync(now);
          if (next) {
            setNextPrayer(next);
            currentPrayerRef.current = next;
            setCountdownText(calculateCountdown(next.time, now));
          }
        } else if (activePrayer) {
          setCountdownText(calculateCountdown(activePrayer.time, now));
        }
      }, 1000);
    };

    init();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  if (!isMounted || !nextPrayer) {
    return (
      <div 
        className="prayer-countdown" 
        style={{ opacity: 0, visibility: "hidden" }}
        aria-hidden="true"
      >
        <span className="prayer-name">Subuh</span>
        <div className="prayer-time-group">
          <span className="prayer-label">dalam</span>
          <span className="prayer-time">00:00:00</span>
        </div>
      </div>
    );
  }

  return (
    <div className="prayer-countdown">
      <span className="prayer-name">{nextPrayer.name}</span>
      <div className="prayer-time-group">
        <span className="prayer-label">dalam</span>
        <span className="prayer-time">{countdownText}</span>
      </div>
    </div>
  );
}
