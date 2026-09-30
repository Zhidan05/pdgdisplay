"use client";
import { useState, useEffect } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import {
  ASPECT_RATIOS,
  type InfoAspectRatio,
  type InfoItem,
  type DisplayType,
} from "@/data/types";
import { normalizeInfoAspectRatio } from "@/lib/board/mapper";
import { formatDate } from "@/lib/broadcast";
import { useBoardData } from "@/lib/supabase-provider";
import { createClient } from "@/util/supabase/client";
import { MediaImage } from "@/components/shared/media-image";
import { EmptyState } from "@/components/shared/broadcast-ui";
import { uploadImageToSupabase, deleteStorageFile } from "@/lib/media-utils";
import {
  DeleteButton,
  Field,
  FormActions,
  Modal,
  Notice,
  PageHeading,
  savedMessage,
} from "./admin-ui";

const displayTypes: Record<DisplayType, string> = {
  latest_info: "Info Terbaru",
  main_poster: "Main Poster",
};

export function AspectRatioSelector({
  value,
  onChange,
  disabled
}: {
  value: InfoAspectRatio;
  onChange: (value: InfoAspectRatio) => void;
  disabled?: boolean;
}) {
  return (
    <Field label="Format gambar">
      <select
        name="ratio"
        value={value}
        onChange={(e) => onChange(e.target.value as InfoAspectRatio)}
        disabled={disabled}
      >
        {Object.entries(ASPECT_RATIOS).map(([key, ratio]) => (
          <option key={key} value={key}>
            {ratio.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function InfoForm({
  item,
  onClose,
  onSaved,
}: {
  item: InfoItem | null;
  onClose: () => void;
  onSaved: (persisted: boolean) => void;
}) {
  const [ratio, setRatio] = useState<InfoAspectRatio>(
    item?.ratio ?? "landscape_16_9",
  );
  const displayType = "latest_info";
  const [imagePreview, setImagePreview] = useState(item?.image ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    
    setLoading(true);
    const supabase = createClient();
    let imageUrl = item?.image || "";
    
    const fileInput = form.get("imageFile") as File;
    if (fileInput && fileInput.size > 0) {
      setError("Mengoptimalkan dan mengunggah gambar...");
      const { url, error: uploadError } = await uploadImageToSupabase(fileInput, "infos");
      
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
      setError("Silakan pilih gambar terlebih dahulu.");
      setLoading(false);
      return;
    }
    
    if (!title && displayType === "latest_info") {
      setError("Isi judul untuk Info Terbaru.");
      setLoading(false);
      return;
    }
    
    const dbValue = {
      title: title,
      image_url: imageUrl,
      description: String(form.get("description")).trim(),
      published_at: String(form.get("date")),
      aspect_ratio: ratio,
      display_type: "latest_info",
    };
    
    if (item) {
      const { error: err } = await supabase.from("infos").update(dbValue).eq("id", item.id);
      if (err) setError(err.message);
      else {
        if (fileInput && fileInput.size > 0 && item.image) {
          await deleteStorageFile(item.image);
        }
        onSaved(true);
        onClose();
      }
    } else {
      const { error: err } = await supabase.from("infos").insert(dbValue);
      if (err) setError(err.message);
      else {
        onSaved(true);
        onClose();
      }
    }
    setLoading(false);
  }
  
  return (
    <form onSubmit={save} className="info-form">
      <div className="info-form-fields">
        <Field label="Judul">
          <input
            name="title"
            defaultValue={item?.title}
            maxLength={120}
            autoFocus
            disabled={loading}
          />
        </Field>
        <Field label="Deskripsi (Opsional)">
          <textarea
            name="description"
            defaultValue={item?.description}
            rows={3}
            maxLength={420}
            disabled={loading}
          />
        </Field>
        <Field label="Tanggal">
          <input
            type="date"
            name="date"
            defaultValue={item?.date ?? new Date().toLocaleDateString("en-CA")}
            required
            disabled={loading}
          />
        </Field>
        <Field
          label="Gambar"
          hint="JPG, JPEG, PNG, atau WebP. Maks 10 MB. Gambar akan otomatis dioptimalkan."
        >
          <input
            type="file"
            name="imageFile"
            accept="image/jpeg, image/png, image/webp"
            disabled={loading}
            required={!item}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                const objectUrl = URL.createObjectURL(e.target.files[0]);
                setImagePreview(objectUrl);
              }
            }}
          />
        </Field>
        <AspectRatioSelector value={ratio} onChange={setRatio} disabled={loading} />
      </div>
      <div className="ratio-preview">
        <span>PRATINJAU FORMAT</span>
        <div
          className="ratio-preview-image"
          style={{ aspectRatio: ASPECT_RATIOS[ratio].value }}
        >
          {imagePreview && (
            <MediaImage
              key={imagePreview}
              src={imagePreview}
              alt="Pratinjau gambar informasi"
            />
          )}
        </div>
        <small>{ASPECT_RATIOS[ratio].label}</small>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <FormActions onCancel={onClose} />
    </form>
  );
}

export function InfoManager() {
  const { info } = useBoardData();
  const [editing, setEditing] = useState<InfoItem | null | undefined>();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();
  
  const deleteItem = async (id: string, imageUrl: string) => {
    const { error } = await supabase.from("infos").delete().eq("id", id);
    if (!error) {
      if (imageUrl) {
        await deleteStorageFile(imageUrl);
      }
      setMessage(savedMessage(true));
    }
  };
  
  const visible = info.filter((i) =>
    `${i.title} ${i.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  
  return (
    <>
      <PageHeading
        title="Info Terbaru & Poster"
        description="Kelola informasi dan poster yang tampil di layar publik."
        action={
          <button className="button primary" onClick={() => setEditing(null)}>
            <Plus size={17} />
            Tambah konten
          </button>
        }
      />
      <Notice message={message} />
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Cari informasi"
            placeholder="Cari judul informasi…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span>{info.length} konten · 4 format gambar</span>
      </div>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>GAMBAR</th>
              <th>INFORMASI</th>
              <th>FORMAT & PENEMPATAN</th>
              <th>TANGGAL</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              const safeRatio = normalizeInfoAspectRatio(item.ratio);
              const ratioConfig = ASPECT_RATIOS[safeRatio] || ASPECT_RATIOS["instagram_portrait"];
              return (
              <tr key={item.id}>
                <td>
                  <div
                    className="table-thumbnail"
                    style={{
                      aspectRatio: ratioConfig.value,
                      width: Math.min(
                        85,
                        115 * ratioConfig.value,
                      ),
                    }}
                  >
                    <MediaImage
                      key={item.image}
                      src={item.image}
                      alt={item.title}
                    />
                  </div>
                </td>
                <td className="info-table-copy">
                  {item.display_type === "latest_info" ? (
                    <>
                      <strong>{item.title || "(Tanpa Judul)"}</strong>
                      <p>{item.description}</p>
                    </>
                  ) : (
                    <span className="text-secondary">—</span>
                  )}
                </td>
                <td>
                  <span className="text-secondary">
                    {ratioConfig.label}
                  </span>
                  <small className="placement-label">
                    {displayTypes[item.display_type]}
                  </small>
                </td>
                <td className="whitespace-nowrap">{item.display_type === "latest_info" ? formatDate(item.date) : "—"}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={`Edit ${item.title}`}
                      onClick={() => setEditing(item)}
                    >
                      <Pencil size={16} />
                    </button>
                    <DeleteButton
                      title={item.title || "Konten"}
                      onDelete={() => deleteItem(item.id, item.image)}
                    />
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>

        {!visible.length && (
          <EmptyState>
            {query
              ? "Tidak ada konten yang cocok."
              : "Belum ada konten. Tambahkan konten pertama Anda."}
          </EmptyState>
        )}
      </div>
      {editing !== undefined && (
        <Modal
          title={editing ? "Edit konten" : "Tambah konten"}
          onClose={() => setEditing(undefined)}
        >
          <InfoForm
            item={editing}
            onClose={() => setEditing(undefined)}
            onSaved={(p) => setMessage(savedMessage(p))}
          />
        </Modal>
      )}
    </>
  );
}
