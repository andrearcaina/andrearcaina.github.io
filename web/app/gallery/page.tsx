import type { Metadata } from "next";
import { Gallery } from "@/components/gallery";
import galleryPhotos from "@/data/gallery.json";

export const metadata: Metadata = {
  title: "gallery · andre arcaina",
  description: "A few photos from outside the editor.",
};

export default function GalleryPage() {
  return (
    <div className="site-page">
      <header className="page-intro">
        <p className="page-label">gallery</p>
        <h1 className="page-title">of pictures i take</h1>
        <p className="page-summary">
          some of my personal life (not all), whether gundam, my homelab, my
          dog, hiking, food, or pokemon, somewhere along the lines.
        </p>
      </header>

      <Gallery photos={galleryPhotos} />
    </div>
  );
}
