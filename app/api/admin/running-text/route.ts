import { NextResponse } from "next/server";
import { createClient } from "@/util/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("running_texts")
    .select("*", { count: "exact" })
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

    if (!body.text || !String(body.text).trim()) {
      return NextResponse.json(
        { error: "Teks informasi tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Backend validation: check maximum limit of 10 Running Text
    const { count, error: countError } = await supabase
      .from("running_texts")
      .select("id", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= 10) {
      return NextResponse.json(
        {
          error:
            "Batas maksimum 10 Running Text telah tercapai. Hapus salah satu data untuk menambahkan data baru.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("running_texts")
      .insert({
        text: String(body.text).trim(),
        sort_order: Number(body.sort_order ?? 1),
        is_active: body.is_active ?? true,
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
              "Batas maksimum 10 Running Text telah tercapai. Hapus salah satu data untuk menambahkan data baru.",
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
