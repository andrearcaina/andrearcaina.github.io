"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryPhoto } from "@/data/types";

function randomPhotos(photos: GalleryPhoto[]) {
  const pool = photos.filter((photo) => photo.src !== "/gallery/profile.webp");

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, 4);
}

export function GalleryPreview({ photos }: { photos: GalleryPhoto[] }) {
  const [previewPhotos, setPreviewPhotos] = useState(() =>
    photos.filter((photo) => photo.src !== "/gallery/profile.webp").slice(0, 4),
  );

  useEffect(() => {
    setPreviewPhotos(randomPhotos(photos));
  }, [photos]);

  return (
    <Link className="elsewhere-preview" href="/gallery" aria-label="Open gallery">
      {previewPhotos.map((photo) => (
        <figure key={photo.src}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 700px) calc(100vw - 1.25rem), 36rem"
            style={{ objectPosition: photo.position }}
          />
          <figcaption className="gallery-caption">{photo.caption}</figcaption>
        </figure>
      ))}
    </Link>
  );
}
