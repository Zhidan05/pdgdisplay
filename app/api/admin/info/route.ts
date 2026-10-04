import { NextResponse } from "next/server";
import { createClient } from "@/util/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("infos")
    .select("*", { count: "exact" })
    .eq("display_type", "latest_info")
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    count: count ?? 0,
    limit: 10,
    isLimitReached: (count ?? 0) >= 10,
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: "Judul dan gambar wajib diisi untuk Info Terbaru." },
        { status: 400 }
      );
    }

    // Backend validation: check maximum limit of 10 Info Terbaru
    const { count, error: countError } = await supabase
      .from("infos")
      .select("id", { count: "exact", head: true })
      .eq("display_type", "latest_info");

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= 10) {
      return NextResponse.json(
        {
          error:
            "Batas maksimum 10 Info Terbaru telah tercapai. Hapus salah satu data untuk menambahkan data baru.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("infos")
      .insert({
        title: body.title,
        description: body.description ?? "",
        image_url: body.image_url,
        aspect_ratio: body.aspect_ratio ?? "landscape_16_9",
        display_type: "latest_info",
        published_at: body.published_at ?? new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      if (
        error.message &&
        (error.message.includes("10") ||
          error.message.toLowerCase().includes("maksimum"))
      ) {
        return NextResponse.json(
          {
            error:
              "Batas maksimum 10 Info Terbaru telah tercapai. Hapus salah satu data untuk menambahkan data baru.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
