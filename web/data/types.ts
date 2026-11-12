export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  position?: string;
};

export type ExperienceItem = {
  role: string;
  company: string;
  location?: string;
  date: string;
  description: string;
  bullets?: string[];
  tech: string[];
};
