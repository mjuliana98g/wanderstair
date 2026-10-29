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
  technique: string;
  department: string;
  description: string | null;
  url: string;
  creators: Creator[];
  images: ArtworkImages | null;
}

export interface ApiResponse<T> {
  data: T;
}

export function artistName(artwork: Artwork): string {
  return artwork.creators[0]?.description ?? 'Unknown artist';
}

export function shortArtistName(artwork: Artwork): string {
  return artistName(artwork).split(' (')[0];
}