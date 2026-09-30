import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "RRI Padang • Info Board",
  description: "Informasi dan jadwal siaran Radio Republik Indonesia Padang.",
};

import { BoardProvider } from "@/lib/supabase-provider";
import { mapBoardData } from "@/lib/board/mapper";
import { createClient } from "@/util/supabase/server";
import { stations as defaultStations } from "@/data/stations";
import { schedules as defaultSchedules } from "@/data/schedules";
import { latestInfo as defaultInfo } from "@/data/latest-info";
import { runningText as defaultTicker } from "@/data/running-text";
import { settings as defaultSettings } from "@/data/settings";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let initialData = {
    stations: defaultStations,
    schedules: defaultSchedules,
    info: defaultInfo,
    ticker: defaultTicker,
    settings: defaultSettings,
  };

  try {
    const [st, sc, inf, tic, set] = await Promise.all([
      supabase.from("stations").select("*").order("sort_order"),
      supabase.from("schedules").select("*").order("sort_order"),
      supabase.from("infos").select("*").order("sort_order"),
      supabase.from("running_texts").select("*").order("sort_order"),
      supabase.from("settings").select("*"),
    ]);

    if (st.data && sc.data && inf.data && tic.data && set.data) {
      initialData = mapBoardData(st.data, sc.data, inf.data, tic.data, set.data);
    }
  } catch (err) {
    console.error("Failed to fetch initial board data:", err);
  }

  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BoardProvider initialData={initialData}>
          {children}
        </BoardProvider>
      </body>
    </html>
  );
}
