"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import type { GalleryPhoto } from "@/data/types";

export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : photos[selectedIndex];

  const move = (direction: 1 | -1) => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + direction + photos.length) % photos.length);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    if (selectedIndex === null) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex]);

  return (
    <>
      <div className={`gallery-grid ${photos.length === 1 ? "gallery-grid-single" : ""}`}>
        {photos.map((photo, index) => (
          <button className="gallery-card" type="button" key={photo.src} onClick={() => setSelectedIndex(index)} aria-label={`Open ${photo.caption}`}>
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) calc(100vw - 1.25rem), (max-width: 1200px) 58vw, 42rem" style={{ objectPosition: photo.position }} />
            <span className="gallery-caption">{photo.caption}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selected.caption} onClick={() => setSelectedIndex(null)}>
          <button className="gallery-close" type="button" aria-label="Close image" onClick={() => setSelectedIndex(null)}><FiX aria-hidden="true" /></button>
          <p className="gallery-counter">#{selectedIndex! + 1} / {photos.length}</p>
          <button className="gallery-navigation gallery-navigation-previous" type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); move(-1); }}><FiChevronLeft aria-hidden="true" /></button>
          <div className="gallery-lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={selected.src} alt={selected.alt} fill sizes="95vw" style={{ objectFit: "contain", objectPosition: selected.position }} priority />
          </div>
          <p className="gallery-lightbox-caption">{selected.caption}</p>
          <button className="gallery-navigation gallery-navigation-next" type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); move(1); }}><FiChevronRight aria-hidden="true" /></button>
        </div>
      )}
    </>
  );
}
