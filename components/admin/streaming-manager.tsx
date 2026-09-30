"use client";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import type { Station } from "@/data/types";
import { useBoardData } from "@/lib/supabase-provider";
import { createClient } from "@/util/supabase/client";
import { channelName, isCurrent, validMediaUrl } from "@/lib/broadcast";
import { useClock } from "@/lib/use-clock";
import { LiveStreamPanel } from "@/components/board/live-stream-panel";
import { Field, Notice, PageHeading, savedMessage } from "./admin-ui";

function StreamSettingsCard({ station }: { station: Station }) {
  const data = useBoardData();
  const now = useClock();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftUrl, setDraftUrl] = useState(station.streamUrl ?? "");

  // Update draft if external station data changes

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftUrl(station.streamUrl ?? "");
  }, [station.streamUrl]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const streamUrl = String(form.get("streamUrl")).trim();
    const name = String(form.get("name")).trim();
    const frequency = String(form.get("frequency")).trim();
    if (!name || !frequency) {
      setError("Nama stasiun dan frekuensi wajib diisi.");
      return;
    }
    if (streamUrl && !validMediaUrl(streamUrl)) {
      setError("Gunakan URL HTTPS atau path lokal yang diawali /.");
      return;
    }
    setError("");
    setLoading(true);
    
    const supabase = createClient();
    const { error: err } = await supabase.from("stations").update({
      name,
      frequency,
      stream_url: streamUrl || null,
    }).eq("code", station.id.toUpperCase());
    
    if (err) setError(err.message);
    else setMessage(savedMessage(true));
    
    setLoading(false);
  }
  return (
    <article className="stream-settings panel">
      <h2>
        {channelName(station.id)} <span>{station.frequency}</span>
      </h2>
      <LiveStreamPanel
        compact
        station={{ ...station, streamUrl: draftUrl }}
        current={data.schedules.find(
          (s) =>
            s.channel === station.id &&
            isCurrent(s, now, data.settings.timezone),
        )}
        fallbackImage={data.settings.fallbackImage}
        mode="preview"
      />
      <form key={JSON.stringify(station)} onSubmit={save}>
        <Field
          label="Stream URL"
          hint="Video MP4/WebM atau Link YouTube Live. Kosongkan untuk menampilkan fallback (OFF AIR)."
        >
          <input
            name="streamUrl"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://youtube.com/live/... atau siaran.mp4"
            maxLength={2000}
            disabled={loading}
          />
        </Field>
        <Field label="Nama stasiun">
          <input
            name="name"
            defaultValue={station.name}
            required
            maxLength={80}
            disabled={loading}
          />
        </Field>
        <Field label="Frekuensi">
          <input
            name="frequency"
            defaultValue={station.frequency}
            required
            maxLength={25}
            disabled={loading}
          />
        </Field>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary w-full" type="submit" disabled={loading}>
          <Save size={16} />
          Simpan {channelName(station.id)}
        </button>
        <Notice message={message} />
      </form>
    </article>
  );
}
export function StreamingManager() {
  const { stations } = useBoardData();
  return (
    <>
      <PageHeading
        title="Streaming"
        description="Atur sumber video untuk setiap saluran. Status siaran mengikuti ketersediaan URL secara otomatis."
      />
      <div className="station-grid">
        {stations.map((station) => (
          <StreamSettingsCard key={station.id} station={station} />
        ))}
      </div>
      <p className="page-note">
        Saluran akan beralih status otomatis menjadi ON AIR jika URL terdeteksi valid. Dukungan YouTube Stream dan Media statis tersedia.
      </p>
    </>
  );
}
