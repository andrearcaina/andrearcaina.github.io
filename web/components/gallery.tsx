"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import type { GalleryPhoto } from "@/data/gallery";

export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className={`gallery-grid ${photos.length === 1 ? "gallery-grid-single" : ""}`}>
        {photos.map((photo) => (
          <button className="gallery-card" type="button" key={photo.src} onClick={() => setSelected(photo)} aria-label={`Open ${photo.caption}`}>
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) calc(100vw - 1.25rem), (max-width: 1200px) 58vw, 42rem" style={{ objectPosition: photo.position }} />
            <span className="gallery-caption">{photo.caption}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selected.caption} onClick={() => setSelected(null)}>
          <button className="gallery-close" type="button" aria-label="Close image" onClick={() => setSelected(null)}><FiX aria-hidden="true" /></button>
          <div className="gallery-lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={selected.src} alt={selected.alt} fill sizes="95vw" style={{ objectFit: "contain", objectPosition: selected.position }} priority />
          </div>
        </div>
      )}
    </>
  );
}
