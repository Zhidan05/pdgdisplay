"use client";
import { useSyncExternalStore } from "react";
import { stations } from "@/data/stations";
import { schedules } from "@/data/schedules";
import { latestInfo } from "@/data/latest-info";
import { runningText } from "@/data/running-text";
import { settings } from "@/data/settings";
import { ASPECT_RATIOS, type BoardData } from "@/data/types";
import { validMediaUrl } from "./broadcast";
export const STORAGE_KEY = "rri-padang-board-v1";
const EVENT = "rri-board-change";
const defaults: BoardData = {
  stations,
  schedules,
  info: latestInfo,
  ticker: runningText,
  settings,
};
let snapshot = defaults;
let rawSnapshot: string | null | undefined;
let memoryOnly = false;
const strings = (v: Record<string, unknown>, keys: string[]) =>
  keys.every((k) => typeof v[k] === "string");
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object";
const channel = (v: unknown) => ["pro1", "pro2", "pro4"].includes(String(v));
const time = (v: unknown) =>
  typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
function valid(value: unknown): value is BoardData {
  if (!object(value)) return false;
  const { stations: s, schedules: p, info: i, ticker: t, settings: c } = value;
  if (
    !Array.isArray(s) ||
    !Array.isArray(p) ||
    !Array.isArray(i) ||
    !Array.isArray(t) ||
    !object(c)
  )
    return false;
  try {
    new Intl.DateTimeFormat("id", { timeZone: String(c.timezone) });
  } catch {
    return false;
  }
  const unique = (items: Record<string, unknown>[]) =>
    new Set(items.map((x) => x.id)).size === items.length;
  return (
    s.length === 3 &&
    s.every(
      (x) =>
        object(x) &&
        channel(x.id) &&
        strings(x, ["name", "frequency", "tagline"]) &&
        (x.streamUrl === null ||
          (typeof x.streamUrl === "string" &&
            (!x.streamUrl || validMediaUrl(x.streamUrl)))),
    ) &&
    unique(s) &&
    p.every(
      (x) =>
        object(x) &&
        strings(x, ["id", "program", "presenter", "day"]) &&
        channel(x.channel) &&
        time(x.start) &&
        time(x.end) &&
        x.start !== x.end &&
        /^(daily|[0-6])$/.test(String(x.day)),
    ) &&
    unique(p) &&
    i.every(
      (x) =>
        object(x) &&
        strings(x, [
          "id",
          "image",
          "title",
          "description",
          "date",
          "ratio",
          "placement",
        ]) &&
        validMediaUrl(String(x.image)) &&
        Object.hasOwn(ASPECT_RATIOS, String(x.ratio)) &&
        ["info", "poster", "both"].includes(String(x.placement)) &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(x.date)) &&
        !Number.isNaN(Date.parse(String(x.date))),
    ) &&
    unique(i) &&
    t.every(
      (x) =>
        object(x) &&
        strings(x, ["id", "text"]) &&
        typeof x.order === "number" &&
        Number.isFinite(x.order) &&
        x.order >= 1 &&
        typeof x.active === "boolean",
    ) &&
    unique(t) &&
    strings(c, ["stationName", "boardTitle", "timezone", "fallbackImage"]) &&
    validMediaUrl(String(c.fallbackImage))
  );
}
function getSnapshot() {
  if (memoryOnly) return snapshot;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== rawSnapshot) {
      rawSnapshot = raw;
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      snapshot = valid(parsed) ? parsed : defaults;
    }
  } catch {
    /* Storage can be unavailable; defaults remain usable. */
  }
  return snapshot;
}
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(EVENT, callback);
  };
}
export function useBoardData() {
  return useSyncExternalStore(subscribe, getSnapshot, () => defaults);
}
export function updateBoard(update: (previous: BoardData) => BoardData) {
  snapshot = update(getSnapshot());
  let persisted = true;
  try {
    const raw = JSON.stringify(snapshot);
    localStorage.setItem(STORAGE_KEY, raw);
    rawSnapshot = raw;
    memoryOnly = false;
  } catch {
    memoryOnly = true;
    persisted = false;
  }
  window.dispatchEvent(new Event(EVENT));
  return persisted;
}
