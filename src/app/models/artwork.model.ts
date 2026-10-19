// --------------------------------------------------
// INTERFACES
// --------------------------------------------------

export interface Artwork {
    id: number;
    title: string;
    artist_title: string;
    date_display: string;
    artwork_type_title: string;
    image_id: string | null;
}

export interface ApiResponse<T> {
    data: T;
}
