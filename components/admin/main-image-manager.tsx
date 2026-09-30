"use client";
import { useState, useEffect } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { type InfoItem } from "@/data/types";
import { useBoardData } from "@/lib/supabase-provider";
import { createClient } from "@/util/supabase/client";
import { MediaImage } from "@/components/shared/media-image";
import { EmptyState } from "@/components/shared/broadcast-ui";
import Cropper from 'react-easy-crop';
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

const checkImageDimensions = (file: File): Promise<{width: number, height: number, url: string}> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height, url });
    };
    img.src = url;
  });
};

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  targetWidth = 1080,
  targetHeight = 1350
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(new File([blob], "cropped.webp", { type: "image/webp" }));
    }, "image/webp", 0.85);
  });
}

export function ImageCropper({
  image,
  onCropDone,
  onCancel
}: {
  image: string,
  onCropDone: (croppedFile: File) => void,
  onCancel: () => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number, y: number, width: number, height: number } | null>(null)

  return (
    <div className="cropper-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', background: '#000', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Atur Potongan Gambar (4:5)</h3>
        <button onClick={onCancel} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={4 / 5}
          onCropChange={setCrop}
          onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
          onZoomChange={setZoom}
        />
      </div>
      <div style={{ padding: '20px', background: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'white' }}>Zoom</span>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '150px' }} />
        </div>
        <button className="button" onClick={onCancel}>Batal</button>
        <button className="button primary" onClick={async () => {
          if (croppedAreaPixels) {
            const file = await getCroppedImg(image, croppedAreaPixels);
            onCropDone(file);
          }
        }}>Gunakan Potongan</button>
      </div>
    </div>
  )
}

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
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [finalFileToUpload, setFinalFileToUpload] = useState<File | null>(null);

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
    
    const fileInput = finalFileToUpload;
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
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const { width, height, url } = await checkImageDimensions(file);
                if (Math.abs(width / height - 0.8) < 0.005) {
                  setFinalFileToUpload(file);
                  setImagePreview(url);
                } else {
                  setCropImageSrc(url);
                }
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
          style={{ width: "100%", height: "auto", maxHeight: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {imagePreview && (
            <img
              key={imagePreview}
              src={imagePreview}
              alt="Pratinjau Gambar Utama"
              style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "300px", aspectRatio: "4/5", objectFit: "cover", borderRadius: "6px" }}
            />
          )}
        </div>
        <small>Gambar diwajibkan dalam rasio 4:5 (Instagram Portrait).</small>
        <p>
          Gambar yang tidak sesuai rasio 4:5 akan dikrop secara otomatis melalui popup untuk memastikan tidak ada ruang kosong atau letterbox di public board.
        </p>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <FormActions onCancel={onClose} />
      
      {cropImageSrc && (
        <ImageCropper
          image={cropImageSrc}
          onCancel={() => {
            setCropImageSrc("");
            // Optionally clear the input file here if needed, but not strictly necessary
          }}
          onCropDone={(file) => {
            setCropImageSrc("");
            setFinalFileToUpload(file);
            setImagePreview(URL.createObjectURL(file));
          }}
        />
      )}
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
