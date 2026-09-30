"use client";
import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { useBoardData } from "@/lib/supabase-provider";
import { createClient } from "@/util/supabase/client";
import { uploadImageToSupabase, deleteStorageFile } from "@/lib/media-utils";
import { MediaImage } from "@/components/shared/media-image";
import {
  Field,
  FormActions,
  Notice,
  PageHeading,
  savedMessage,
} from "./admin-ui";

export function SettingsManager() {
  const { settings } = useBoardData();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fallbackImagePreview, setFallbackImagePreview] = useState(settings.fallbackImage);

  useEffect(() => {
    return () => {
      if (fallbackImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(fallbackImagePreview);
      }
    };
  }, [fallbackImagePreview]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = {
      stationName: String(form.get("stationName")).trim(),
      boardTitle: String(form.get("boardTitle")).trim(),
      timezone: String(form.get("timezone")),
      fallbackImage: String(form.get("fallbackImage")).trim(),
      infoInterval: Number(form.get("infoInterval")),
      mainImageInterval: Number(form.get("mainImageInterval")),
    };
    if (
      !value.boardTitle
    ) {
      setError(
        "Lengkapi identitas dengan benar.",
      );
      return;
    }
    setError("");
    let imageUrl = value.fallbackImage;
    const fileInput = form.get("fallbackImageFile") as File;
    if (fileInput && fileInput.size > 0) {
      setError("Mengoptimalkan dan mengunggah gambar...");
      const { url, error: uploadError } = await uploadImageToSupabase(fileInput, "fallback");
      if (uploadError) {
        setError(uploadError);
        setLoading(false);
        return;
      }
      if (url) {
        imageUrl = url;
      }
    }
    
    if (!imageUrl) {
       setError("Gambar fallback harus disediakan.");
       setLoading(false);
       return;
    }
    
    const supabase = createClient();
    const updates = [
      { key: "station_name", value: value.stationName },
      { key: "board_title", value: value.boardTitle },
      { key: "timezone", value: value.timezone },
      { key: "fallback_image", value: imageUrl },
      { key: "info_carousel_interval", value: value.infoInterval.toString() },
      { key: "main_image_interval", value: value.mainImageInterval.toString() },
    ];
    
    const { error: err } = await supabase.from("settings").upsert(updates, { onConflict: "key" });
    
    if (err) {
      setError(err.message);
    } else {
      if (fileInput && fileInput.size > 0 && settings.fallbackImage !== imageUrl) {
         await deleteStorageFile(settings.fallbackImage);
      }
      setMessage(savedMessage(true));
    }
    setLoading(false);
  }
  return (
    <>
      <PageHeading
        title="Pengaturan"
        description="Identitas stasiun dan preferensi tampilan Info Board."
      />
      <Notice message={message} />
      <div className="settings-grid">
        <section className="panel settings-panel">
          <h2>
            <Building2 size={20} />
            Identitas stasiun
          </h2>
          <form
            key={JSON.stringify(settings)}
            onSubmit={save}
            className="form-stack"
          >
            <Field label="Nama stasiun penyiaran">
              <input
                name="stationName"
                defaultValue={settings.stationName}
                required
                maxLength={35}
                disabled={loading}
              />
            </Field>
            <Field label="Judul Info Board">
              <input
                name="boardTitle"
                defaultValue={settings.boardTitle}
                required
                maxLength={60}
                disabled={loading}
              />
            </Field>
            <Field label="Zona waktu">
              <select name="timezone" defaultValue={settings.timezone} disabled={loading}>
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </Field>
            <Field
              label="Gambar fallback"
              hint="JPG, PNG, atau WebP. Maks. 10 MB. Tampil saat saluran tidak ada siaran. Gambar otomatis dioptimalkan."
            >
              <input
                type="file"
                name="fallbackImageFile"
                accept="image/jpeg, image/png, image/webp"
                disabled={loading}
                onChange={(e) => {
                   if (e.target.files && e.target.files[0]) {
                     if (fallbackImagePreview.startsWith("blob:")) URL.revokeObjectURL(fallbackImagePreview);
                     const objectUrl = URL.createObjectURL(e.target.files[0]);
                     setFallbackImagePreview(objectUrl);
                   }
                }}
              />
              <input type="hidden" name="fallbackImage" value={settings.fallbackImage} />
            </Field>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <FormActions label="Simpan pengaturan" />
          </form>
        </section>
        
        <section className="panel settings-panel" style={{ marginTop: "16px" }}>
          <h2>
            <Building2 size={20} />
            Rotasi Konten
          </h2>
          <form
            key={JSON.stringify(settings)}
            onSubmit={save}
            className="form-stack"
          >
            <input type="hidden" name="stationName" value={settings.stationName} />
            <input type="hidden" name="boardTitle" value={settings.boardTitle} />
            <input type="hidden" name="timezone" value={settings.timezone} />
            <input type="hidden" name="fallbackImage" value={settings.fallbackImage} />
            
            <Field
              label="Interval Info Terbaru (detik)"
              hint="Waktu setiap Info Terbaru ditampilkan sebelum berpindah ke informasi berikutnya."
            >
              <input
                type="number"
                min={3}
                max={300}
                name="infoInterval"
                defaultValue={settings.infoInterval}
                required
                disabled={loading}
              />
            </Field>
            
            <Field
              label="Interval Gambar Utama (detik)"
              hint="Waktu setiap Gambar Utama ditampilkan sebelum berpindah ke gambar berikutnya."
            >
              <input
                type="number"
                min={3}
                max={300}
                name="mainImageInterval"
                defaultValue={settings.mainImageInterval}
                required
                disabled={loading}
              />
            </Field>
            
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <FormActions label="Simpan pengaturan" />
          </form>
        </section>
      </div>
      <div className="settings-grid">
        <aside className="panel settings-preview">
          <span className="eyebrow">GAMBAR FALLBACK AKTIF</span>
          <div>
            <MediaImage
              key={fallbackImagePreview}
              src={fallbackImagePreview}
              alt="Pratinjau Fallback Image"
            />
          </div>
          <h3>Siaran sedang tidak tersedia</h3>
          <p>
            Gambar ini tampil otomatis saat saluran belum memiliki stream URL.
          </p>
          <hr />
          <small>
            Pengaturan disimpan pada database dan disinkronkan secara realtime.
          </small>
        </aside>
      </div>
    </>
  );
}
