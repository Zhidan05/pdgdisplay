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
        style={{ 
          fontSize: "0.85em", 
          opacity: 0, 
          minHeight: "1.2em",
          marginTop: "0.15em"
        }}
      >
        Placeholder
      </div>
    );
  }

  return (
    <div 
      className="prayer-countdown" 
      style={{ 
        fontSize: "0.85em", 
        opacity: 0.85, 
        marginTop: "0.15em",
        fontWeight: 500,
        lineHeight: 1
      }}
    >
      <span style={{ fontWeight: 600 }}>{nextPrayer.name}</span> dalam <span style={{ opacity: 0.9 }}>{countdownText}</span>
    </div>
  );
}
