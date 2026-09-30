"use client";
import { useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { type InfoItem } from "@/data/types";
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

export function MainImageForm({
  item,
  onClose,
  onSaved,
}: {
  item: InfoItem | null;
  onClose: () => void;
  onSaved: (persisted: boolean) => void;
}) {
  const [imagePreview, setImagePreview] = useState(item?.image ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const { url, error: uploadError } = await uploadImageToSupabase(fileInput, "main-posters");
      
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
    
    const dbValue = {
      title: title || null,
      image_url: imageUrl,
      aspect_ratio: null,
      display_type: "main_poster",
      is_active: form.get("isActive") === "on",
      sort_order: Number(form.get("sortOrder")),
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
        <Field label="Judul (opsional)">
          <input
            name="title"
            defaultValue={item?.title}
            maxLength={120}
            autoFocus
            disabled={loading}
          />
        </Field>
        
        <Field
          label="Gambar"
          hint="JPG, PNG, atau WebP • Maks. 10 MB • otomatis dioptimalkan"
        >
          <input
            type="file"
            name="imageFile"
            accept="image/jpeg, image/png, image/webp"
            disabled={loading}
            required={!item}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const objectUrl = URL.createObjectURL(e.target.files[0]);
                setImagePreview(objectUrl);
              }
            }}
          />
        </Field>
        
        <Field label="Status Tampil">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item ? item.active : true}
              disabled={loading}
            />
            <span style={{ fontSize: '14px' }}>Aktif (Tampil di Board)</span>
          </label>
        </Field>
        
        <Field label="Urutan" hint="Gambar akan diurutkan dari yang terkecil ke terbesar">
          <input
            type="number"
            name="sortOrder"
            defaultValue={item ? item.order : 0}
            required
            disabled={loading}
          />
        </Field>
      </div>
      <div className="ratio-preview">
        <span>PRATINJAU FORMAT</span>
        <div
          className="ratio-preview-image"
          style={{ width: "100%", height: "auto", maxHeight: "300px", objectFit: "contain", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {imagePreview && (
            <img
              key={imagePreview}
              src={imagePreview}
              alt="Pratinjau Gambar Utama"
              style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "6px" }}
            />
          )}
        </div>
        <small>Rasio gambar akan dipertahankan secara otomatis.</small>
        <p>
          Gambar Utama ditampilkan dengan ukuran penuh dan menyesuaikan proporsi tanpa crop.
        </p>
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

export function MainImageManager() {
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
  
  const mainImages = info.filter((i) => i.display_type === "main_poster");
  
  const visible = mainImages.filter((i) =>
    (i.title || "").toLowerCase().includes(query.toLowerCase()),
  );
  
  return (
    <>
      <PageHeading
        title="Gambar Utama"
        description="Kelola gambar besar yang tampil di kolom tengah Info Board."
        action={
          <button className="button primary" onClick={() => setEditing(null)}>
            <Plus size={17} />
            Tambah Gambar Utama
          </button>
        }
      />
      <Notice message={message} />
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Cari gambar"
            placeholder="Cari judul gambar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span>{mainImages.length} gambar</span>
      </div>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>GAMBAR</th>
              <th>JUDUL</th>
              <th>STATUS</th>
              <th>URUTAN</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              return (
              <tr key={item.id}>
                <td>
                  <div
                    className="table-thumbnail"
                    style={{
                      height: 85,
                      width: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden"
                    }}
                  >
                    <MediaImage
                      key={item.image}
                      src={item.image}
                      alt={item.title || "Gambar Utama"}
                    />
                  </div>
                </td>
                <td className="info-table-copy">
                  <strong>{item.title || "(Tanpa Judul)"}</strong>
                </td>
                <td>
                  <span className={`broadcast-status ${item.active ? "on" : "off"}`}>
                    <i />
                    {item.active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td>
                  {item.order}
                </td>
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
                      title={item.title || "Gambar Utama"}
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
              ? "Tidak ada gambar utama yang cocok."
              : "Belum ada gambar utama. Tambahkan gambar pertama Anda."}
          </EmptyState>
        )}
      </div>
      {editing !== undefined && (
        <Modal
          title={editing ? "Edit Gambar Utama" : "Tambah Gambar Utama"}
          onClose={() => setEditing(undefined)}
        >
          <MainImageForm
            item={editing}
            onClose={() => setEditing(undefined)}
            onSaved={(p) => setMessage(savedMessage(p))}
          />
        </Modal>
      )}
    </>
  );
}
