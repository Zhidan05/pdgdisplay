export type ChannelId = "pro1" | "pro2" | "pro4";
export type InfoAspectRatio =
  | "instagram_landscape"
  | "instagram_portrait"
  | "landscape_16_9"
  | "portrait_9_16";
export type DisplayType = "main_poster" | "latest_info";
export interface Station {
  id: ChannelId;
  name: string;
  frequency: string;
  tagline: string;
  streamUrl: string | null;
}
export interface Schedule {
  id: string;
  channel: ChannelId;
  start: string;
  end: string;
  program: string;
  presenter: string;
  day: string;
}
export interface InfoItem {
  id: string;
  image: string;
  title: string;
  description: string;
  date: string;
  ratio: InfoAspectRatio;
  display_type: DisplayType;
  active: boolean;
  order: number;
}
export interface TickerItem {
  id: string;
  text: string;
  order: number;
  active: boolean;
}
export interface Settings {
  stationName: string;
  boardTitle: string;
  timezone: string;
  fallbackImage: string;
  infoInterval: number;
  mainImageInterval: number;
}
export interface BoardData {
  stations: Station[];
  schedules: Schedule[];
  info: InfoItem[];
  ticker: TickerItem[];
  settings: Settings;
}
export const ASPECT_RATIOS: Record<
  InfoAspectRatio,
  { label: string; value: number }
> = {
  instagram_landscape: {
    label: "Instagram Horizontal — 1.91:1",
    value: 1.91,
  },
  instagram_portrait: { label: "Instagram Vertikal — 4:5", value: 4 / 5 },
  landscape_16_9: { label: "16:9 Horizontal — 16:9", value: 16 / 9 },
  portrait_9_16: { label: "16:9 Vertikal — 9:16", value: 9 / 16 },
};
export const DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
