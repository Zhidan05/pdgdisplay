"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import type { Station } from "@/data/types";
import { useBoardData } from "@/lib/supabase-provider";
import { createClient } from "@/util/supabase/client";
import { channelName, isCurrent, validMediaUrl, parseYouTubeVideoId } from "@/lib/broadcast";
import { useClock } from "@/lib/use-clock";
import { LiveStreamPanel } from "@/components/board/live-stream-panel";
import { Field, Notice, PageHeading, savedMessage } from "./admin-ui";

function StreamSettingsCard({ station }: { station: Station }) {
  const data = useBoardData();
  const now = useClock();

  // YouTube Form state
  const [draftYoutube, setDraftYoutube] = useState(station.youtubeUrl ?? "");
  const [ytMessage, setYtMessage] = useState("");
  const [ytError, setYtError] = useState("");
  const [loadingYt, setLoadingYt] = useState(false);

  // RRI Form state
  const [draftRri, setDraftRri] = useState(station.rriUrl ?? "");
  const [rriMessage, setRriMessage] = useState("");
  const [rriError, setRriError] = useState("");
  const [loadingRri, setLoadingRri] = useState(false);

  // Identity Form state
  const [draftName, setDraftName] = useState(station.name);
  const [draftFrequency, setDraftFrequency] = useState(station.frequency);
  const [identityMessage, setIdentityMessage] = useState("");
  const [identityError, setIdentityError] = useState("");
  const [loadingIdentity, setLoadingIdentity] = useState(false);

  async function saveYoutube(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawUrl = draftYoutube.trim();

    if (rawUrl) {
      if (!validMediaUrl(rawUrl)) {
        setYtError("Gunakan URL HTTPS yang valid.");
        return;
      }
      if (!parseYouTubeVideoId(rawUrl)) {
        setYtError("Gunakan tautan YouTube yang valid (youtube.com atau youtu.be).");
        return;
      }
    }

    setYtError("");
    setYtMessage("");
    setLoadingYt(true);

    const supabase = createClient();
    const currentRri = (station.rriUrl ?? "").trim();
    const effectiveStreamUrl = rawUrl || currentRri || null;

    // 1. Persist to settings table (independent key)
    const { error: setErr } = await supabase.from("settings").upsert(
      [{ key: `stream_youtube_${station.id}`, value: rawUrl }],
      { onConflict: "key" }
    );

    if (setErr) {
      setYtError(setErr.message);
      setLoadingYt(false);
      return;
    }

    // 2. Persist to stations table (effective active stream and youtube_url column)
    const updatePayload: Record<string, unknown> = {
      stream_url: effectiveStreamUrl,
      youtube_url: rawUrl || null,
    };
    const { error: stationErr } = await supabase
      .from("stations")
      .update(updatePayload)
      .eq("code", station.id.toUpperCase());

    if (stationErr) {
      await supabase
        .from("stations")
        .update({ stream_url: effectiveStreamUrl })
        .eq("code", station.id.toUpperCase());
    }

    setYtMessage(savedMessage(true));
    setLoadingYt(false);
  }

  async function saveRri(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawUrl = draftRri.trim();

    if (rawUrl) {
      if (!validMediaUrl(rawUrl)) {
        setRriError("Gunakan URL streaming HTTPS atau path lokal yang valid.");
        return;
      }
    }

    setRriError("");
    setRriMessage("");
    setLoadingRri(true);

    const supabase = createClient();
    const currentYt = (station.youtubeUrl ?? "").trim();
    const effectiveStreamUrl = currentYt || rawUrl || null;

    // 1. Persist to settings table (independent key)
    const { error: setErr } = await supabase.from("settings").upsert(
      [{ key: `stream_rri_${station.id}`, value: rawUrl }],
      { onConflict: "key" }
    );

    if (setErr) {
      setRriError(setErr.message);
      setLoadingRri(false);
      return;
    }

    // 2. Persist to stations table (effective active stream and rri_url column)
    const updatePayload: Record<string, unknown> = {
      stream_url: effectiveStreamUrl,
      rri_url: rawUrl || null,
    };
    const { error: stationErr } = await supabase
      .from("stations")
      .update(updatePayload)
      .eq("code", station.id.toUpperCase());

    if (stationErr) {
      await supabase
        .from("stations")
        .update({ stream_url: effectiveStreamUrl })
        .eq("code", station.id.toUpperCase());
    }

    setRriMessage(savedMessage(true));
    setLoadingRri(false);
  }

  async function saveIdentity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    const frequency = draftFrequency.trim();

    if (!name || !frequency) {
      setIdentityError("Nama stasiun dan frekuensi wajib diisi.");
      return;
    }

    setIdentityError("");
    setIdentityMessage("");
    setLoadingIdentity(true);

    const supabase = createClient();
    const { error: err } = await supabase
      .from("stations")
      .update({ name, frequency })
      .eq("code", station.id.toUpperCase());

    if (err) {
      setIdentityError(err.message);
    } else {
      setIdentityMessage(savedMessage(true));
    }
    setLoadingIdentity(false);
  }

  return (
    <article className="stream-settings panel">
      <h2>
        {channelName(station.id)} <span>{station.frequency}</span>
      </h2>

      {/* Live Preview based on current draft state */}
      <LiveStreamPanel
        compact
        station={{
          ...station,
          name: draftName,
          frequency: draftFrequency,
          youtubeUrl: draftYoutube.trim() || null,
          rriUrl: draftRri.trim() || null,
          streamUrl: (draftYoutube.trim() || draftRri.trim()) || null,
        }}
        current={data.schedules.find(
          (s) =>
            s.channel === station.id &&
            isCurrent(s, now, data.settings.timezone),
        )}
        fallbackImage={data.settings.fallbackImage}
        mode="preview"
      />

      {/* Form A: Streaming YouTube */}
      <form onSubmit={saveYoutube} className="stream-form-block">
        <div className="stream-form-header">
          <span className="stream-form-badge yt">Streaming YouTube</span>
          <span className="stream-form-priority">Prioritas 1</span>
        </div>
        <Field
          label="Link Streaming YouTube"
          hint="Input URL YouTube Live atau Video. Admin dapat mengisi, mengubah, atau mengosongkan link ini."
        >
          <input
            name="youtubeUrl"
            value={draftYoutube}
            onChange={(e) => {
              setDraftYoutube(e.target.value);
              setYtError("");
              setYtMessage("");
            }}
            placeholder="https://www.youtube.com/live/... atau https://youtu.be/..."
            maxLength={2000}
            disabled={loadingYt}
          />
        </Field>
        {ytError && (
          <p className="form-error" role="alert">
            {ytError}
          </p>
        )}
        <button className="button primary w-full" type="submit" disabled={loadingYt}>
          <Save size={16} />
          {loadingYt ? "Menyimpan..." : `Simpan Link YouTube ${channelName(station.id)}`}
        </button>
        <Notice message={ytMessage} />
      </form>

      {/* Form B: Streaming RRI */}
      <form onSubmit={saveRri} className="stream-form-block">
        <div className="stream-form-header">
          <span className="stream-form-badge rri">Streaming RRI</span>
          <span className="stream-form-priority">Prioritas 2 / Fallback</span>
        </div>
        <Field
          label="Link Streaming RRI"
          hint="Input URL direct stream RRI (MP3/AAC). Admin dapat mengisi, mengubah, atau mengosongkan link ini."
        >
          <input
            name="rriUrl"
            value={draftRri}
            onChange={(e) => {
              setDraftRri(e.target.value);
              setRriError("");
              setRriMessage("");
            }}
            placeholder="https://pro1-streaming.rri.go.id/rripadangpro1.mp3"
            maxLength={2000}
            disabled={loadingRri}
          />
        </Field>
        {rriError && (
          <p className="form-error" role="alert">
            {rriError}
          </p>
        )}
        <button className="button primary w-full" type="submit" disabled={loadingRri}>
          <Save size={16} />
          {loadingRri ? "Menyimpan..." : `Simpan Link RRI ${channelName(station.id)}`}
        </button>
        <Notice message={rriMessage} />
      </form>

      {/* Form C: Identitas Stasiun */}
      <form onSubmit={saveIdentity} className="stream-form-block identity-block">
        <Field label="Nama stasiun">
          <input
            name="name"
            value={draftName}
            onChange={(e) => {
              setDraftName(e.target.value);
              setIdentityError("");
              setIdentityMessage("");
            }}
            required
            maxLength={80}
            disabled={loadingIdentity}
          />
        </Field>
        <Field label="Frekuensi">
          <input
            name="frequency"
            value={draftFrequency}
            onChange={(e) => {
              setDraftFrequency(e.target.value);
              setIdentityError("");
              setIdentityMessage("");
            }}
            required
            maxLength={25}
            disabled={loadingIdentity}
          />
        </Field>
        {identityError && (
          <p className="form-error" role="alert">
            {identityError}
          </p>
        )}
        <button className="button secondary w-full" type="submit" disabled={loadingIdentity}>
          <Save size={16} />
          {loadingIdentity ? "Menyimpan..." : `Simpan Identitas ${channelName(station.id)}`}
        </button>
        <Notice message={identityMessage} />
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
        description="Atur sumber streaming terpisah untuk YouTube dan RRI. Status siaran mengikuti ketersediaan URL secara otomatis."
      />
      <div className="station-grid">
        {stations.map((station) => (
          <StreamSettingsCard
            key={`${station.id}-${station.youtubeUrl ?? ""}-${station.rriUrl ?? ""}-${station.name}-${station.frequency}`}
            station={station}
          />
        ))}
      </div>
      <p className="page-note">
        Setiap saluran memiliki dua form konfigurasi streaming independen. YouTube digunakan sebagai sumber utama, dan RRI direct audio stream digunakan sebagai fallback otomatis atau sumber saat YouTube kosong. Jika kedua link kosong, status siaran otomatis OFF AIR.
      </p>
    </>
  );
}

