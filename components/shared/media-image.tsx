"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function MediaImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`media-placeholder ${className}`}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e293b",
          color: "#475569",
          borderRadius: "inherit"
        }}
      >
        <ImageIcon size={48} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1600px) 800px, 600px"
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
