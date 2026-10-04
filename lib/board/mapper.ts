import type { BoardData, InfoItem, Schedule, Station, TickerItem, Settings, InfoAspectRatio } from "@/data/types";
import { parseYouTubeVideoId, isAudioStreamUrl } from "@/lib/broadcast";

export function normalizeInfoAspectRatio(value: string | null | undefined): InfoAspectRatio {
  switch (value) {
    case "instagram_landscape":
    case "instagram-landscape":
      return "instagram_landscape";
    case "instagram_portrait":
    case "instagram-portrait":
      return "instagram_portrait";
    case "landscape_16_9":
    case "16:9":
      return "landscape_16_9";
    case "portrait_9_16":
    case "9:16":
      return "portrait_9_16";
    default:
      return "instagram_portrait";
  }
}

export function mapBoardData(
  stationsRow: Record<string, unknown>[],
  schedulesRow: Record<string, unknown>[],
  infosRow: Record<string, unknown>[],
  tickersRow: Record<string, unknown>[],
  settingsRow: Record<string, unknown>[]
): BoardData {
  const stations: Station[] = stationsRow.map((r) => {
    const channel = (r.code as string).toLowerCase() as Station["id"];
    const ytSetting = settingsRow.find((s) => s.key === `stream_youtube_${channel}`);
    const rriSetting = settingsRow.find((s) => s.key === `stream_rri_${channel}`);

    let youtubeUrl: string | null = null;
    let rriUrl: string | null = null;

    if (ytSetting !== undefined) {
      youtubeUrl = (ytSetting.value as string)?.trim() || null;
    } else if (r.youtube_url !== undefined && r.youtube_url !== null) {
      youtubeUrl = (r.youtube_url as string)?.trim() || null;
    } else if (r.stream_url && parseYouTubeVideoId(r.stream_url as string)) {
      youtubeUrl = (r.stream_url as string).trim();
    }

    if (rriSetting !== undefined) {
      rriUrl = (rriSetting.value as string)?.trim() || null;
    } else if (r.rri_url !== undefined && r.rri_url !== null) {
      rriUrl = (r.rri_url as string)?.trim() || null;
    } else if (
      r.stream_url &&
      !parseYouTubeVideoId(r.stream_url as string) &&
      isAudioStreamUrl(r.stream_url as string)
    ) {
      rriUrl = (r.stream_url as string).trim();
    }

    let effectiveStreamUrl = youtubeUrl || rriUrl || null;
    if (!effectiveStreamUrl && r.stream_url && ytSetting === undefined && rriSetting === undefined) {
      effectiveStreamUrl = (r.stream_url as string).trim() || null;
    }

    return {
      id: channel,
      name: r.name as string,
      frequency: r.frequency as string,
      tagline: (r.tagline as string) || "",
      streamUrl: effectiveStreamUrl,
      youtubeUrl,
      rriUrl,
    };
  });

  const schedules: Schedule[] = schedulesRow.map((r) => {
    const station = stationsRow.find((s) => s.id === r.station_id);
    return {
      id: r.id as string,
      channel: (station ? (station.code as string).toLowerCase() : "pro1") as Schedule["channel"],
      start: (r.start_time as string).substring(0, 5),
      end: (r.end_time as string).substring(0, 5),
      program: r.title as string,
      presenter: (r.presenter as string) || "",
      daysOfWeek: Array.isArray(r.days_of_week) ? (r.days_of_week as number[]) : [],
    };
  });

  const info: InfoItem[] = infosRow.map((r) => ({
    id: r.id as string,
    image: r.image_url as string,
    title: (r.title as string) || "",
    description: (r.description as string) || "",
    date: (r.published_at as string) || "",
    ratio: normalizeInfoAspectRatio(r.aspect_ratio as string | null),
    display_type: r.display_type as InfoItem["display_type"],
    active: r.is_active as boolean ?? true,
    order: r.sort_order as number ?? 0,
  }));

  const ticker: TickerItem[] = tickersRow.map((r) => ({
    id: r.id as string,
    text: r.text as string,
    order: r.sort_order as number,
    active: r.is_active as boolean,
  }));

  const settingsObj: Partial<Settings> = {
    stationName: "RRI PADANG",
    boardTitle: "Radio Republik Indonesia",
    timezone: "Asia/Jakarta",
    fallbackImage: "",
    infoInterval: 8,
    mainImageInterval: 10,
    addressLine1: "",
    addressLine2: "",
  };
  settingsRow.forEach((r) => {
    if (r.key === "station_name") settingsObj.stationName = r.value as string;
    if (r.key === "board_title") settingsObj.boardTitle = r.value as string;
    if (r.key === "timezone") settingsObj.timezone = r.value as string;
    if (r.key === "fallback_image") {
      const val = r.value as string;
      if (val && !val.includes("studio.jpg")) {
        settingsObj.fallbackImage = val;
      }
    }
    if (r.key === "info_carousel_interval") settingsObj.infoInterval = parseInt(r.value as string) || 8;
    if (r.key === "main_image_interval") settingsObj.mainImageInterval = parseInt(r.value as string) || 10;
    if (r.key === "address_line_1") settingsObj.addressLine1 = r.value as string;
    if (r.key === "address_line_2") settingsObj.addressLine2 = r.value as string;
  });

  return {
    stations,
    schedules,
    info,
    ticker,
    settings: settingsObj as Settings,
  };
}
