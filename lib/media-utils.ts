import imageCompression from "browser-image-compression";
import { createClient } from "@/util/supabase/client";

export async function uploadImageToSupabase(file: File, folder: string): Promise<{ url?: string; error?: string }> {
  // Basic validation
  if (!file.type.startsWith("image/")) {
    return { error: "Format gambar harus JPG, JPEG, PNG, atau WebP." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "Gambar maksimal 10 MB." };
  }

  try {
    // Compress and convert to WebP
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 10,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.82,
    });

    const supabase = createClient();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from("rri-content").upload(filePath, compressedFile, {
      contentType: "image/webp",
      upsert: false
    });
    
    if (error) {
      return { error: `Gagal mengunggah gambar: ${error.message}` };
    }

    const { data: { publicUrl } } = supabase.storage.from("rri-content").getPublicUrl(filePath);
    return { url: publicUrl };
  } catch (error) {
    return { error: `Gagal mengoptimalkan gambar: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}` };
  }
}

export function parseYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([^#&?]*).*/);
  return match && match[1].length === 11 ? match[1] : null;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&rel=0`;
}

export type StreamSource =
  | { type: "youtube"; videoId: string; embedUrl: string }
  | { type: "video"; url: string }
  | { type: "unknown"; url: string };

export function getStreamSource(url: string): StreamSource | null {
  if (!url || !url.trim()) return null;
  const ytId = parseYouTubeVideoId(url);
  if (ytId) {
    return { type: "youtube", videoId: ytId, embedUrl: getYouTubeEmbedUrl(ytId) };
  }
  if (url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("/media/")) {
    return { type: "video", url };
  }
  return { type: "unknown", url };
}

export async function deleteStorageFile(url: string) {
  if (!url || !url.includes("rri-content/")) return;
  try {
    const supabase = createClient();
    const path = url.split("rri-content/")[1];
    if (path) {
      await supabase.storage.from("rri-content").remove([path]);
    }
  } catch {
    // Ignore deletion errors to prevent blocking database operations
  }
}
