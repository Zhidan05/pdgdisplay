"use client";
import Image from "next/image";
import { useState } from "react";
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
  return (
    <Image
      src={failed ? "/images/fallback/office.jpg" : src}
      alt={alt}
      fill
      sizes="(min-width: 1600px) 800px, 600px"
      unoptimized={src.startsWith("https:")}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
