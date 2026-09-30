"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/util/supabase/client";
import type { BoardData, InfoItem, Schedule, Station, TickerItem, Settings } from "@/data/types";

const BoardContext = createContext<BoardData | null>(null);

import { mapBoardData } from "@/lib/board/mapper";

export function BoardProvider({
  initialData,
  children,
}: {
  initialData: BoardData;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<BoardData>(initialData);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchAll = async () => {
      const [st, sc, inf, tic, set] = await Promise.all([
        supabase.from("stations").select("*").order("sort_order"),
        supabase.from("schedules").select("*").order("sort_order"),
        supabase.from("infos").select("*").order("sort_order"),
        supabase.from("running_texts").select("*").order("sort_order"),
        supabase.from("settings").select("*"),
      ]);
      
      if (st.data && sc.data && inf.data && tic.data && set.data) {
        setData(
          mapBoardData(st.data, sc.data, inf.data, tic.data, set.data)
        );
      }
    };

    const channel = supabase
      .channel("public_board_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        ( ) => {
          fetchAll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <BoardContext.Provider value={data}>{children}</BoardContext.Provider>;
}

export function useBoardData() {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error("useBoardData must be used within BoardProvider");
  }
  return ctx;
}
