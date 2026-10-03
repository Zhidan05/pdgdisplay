"use client";

import { useEffect, useState } from "react";
import { getNextPrayer, calculateCountdown, type NextPrayer } from "@/lib/prayer-times";

export function PrayerCountdown() {
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [countdownText, setCountdownText] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    let currentPrayer = getNextPrayer();
    setNextPrayer(currentPrayer);
    setCountdownText(calculateCountdown(currentPrayer.time, new Date()));

    const timer = setInterval(() => {
      const now = new Date();
      if (now.getTime() >= currentPrayer.time.getTime()) {
        // Time passed, get the next one
        currentPrayer = getNextPrayer(now);
        setNextPrayer(currentPrayer);
      }
      
      setCountdownText(calculateCountdown(currentPrayer.time, now));
    }, 1000);

    return () => clearInterval(timer);
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
