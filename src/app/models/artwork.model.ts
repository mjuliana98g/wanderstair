// --------------------------------------------------
// INTERFACES
// --------------------------------------------------

export interface Creator {
  description: string;
}

export interface ArtworkImages {
  web: { url: string };
}

export interface Artwork {
  id: number;
  title: string;
  creation_date: string;
  type: string;
  creators: Creator[];
  images: ArtworkImages | null;
}

export interface ApiResponse<T> {
  data: T;
}