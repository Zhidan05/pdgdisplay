"use client";
import { useEffect, useState } from "react";
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
