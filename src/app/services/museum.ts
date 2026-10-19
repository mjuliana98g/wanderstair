import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse, Artwork } from '../models/artwork.model';

// --------------------------------------------------
// MUSEUM SETTINGS
// --------------------------------------------------

const API_URL = 'https://api.artic.edu/api/v1/artworks';
const IMAGE_URL = 'https://www.artic.edu/iiif/2';
const FIELDS = 'id,title,artist_title,date_display,artwork_type_title,image_id';

// --------------------------------------------------
// MUSEUM SERVICE
// --------------------------------------------------

@Injectable({ providedIn: 'root' })
export class MuseumService {
  private http = inject(HttpClient);

  getByIds(ids: number[]): Observable<ApiResponse<Artwork[]>> {
    const params = { ids: ids.join(','), fields: FIELDS };
    return this.http.get<ApiResponse<Artwork[]>>(API_URL, { params });
  }

  getById(id: number): Observable<ApiResponse<Artwork>> {
    const params = { fields: FIELDS };
    return this.http.get<ApiResponse<Artwork>>(`${API_URL}/${id}`, { params });
  }

  search(term: string): Observable<ApiResponse<Artwork[]>> {
    const params = {
      q: term,
      fields: FIELDS,
      limit: 20,
      'query[term][is_public_domain]': true
    };
    return this.http.get<ApiResponse<Artwork[]>>(`${API_URL}/search`, { params });
  }

  imageUrl(imageId: string): string {
    return `${IMAGE_URL}/${imageId}/full/843,/0/default.jpg`;
  }
}