import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

import { ApiResponse, Artwork } from '../models/artwork.model';

// --------------------------------------------------
// MUSEUM SETTINGS
// --------------------------------------------------

const API_URL = 'https://openaccess-api.clevelandart.org/api/artworks';
const FIELDS = 'id,title,creation_date,type,creators,images';

// --------------------------------------------------
// MUSEUM SERVICE
// --------------------------------------------------

@Injectable({ providedIn: 'root' })
export class MuseumService {
  private http = inject(HttpClient);

  getById(id: number): Observable<Artwork> {
    const params = { fields: FIELDS };
    return this.http
      .get<ApiResponse<Artwork>>(`${API_URL}/${id}`, { params })
      .pipe(map((response) => response.data));
  }

  getByIds(ids: number[]): Observable<Artwork[]> {
    return forkJoin(ids.map((id) => this.getById(id)));
  }

  search(term: string): Observable<Artwork[]> {
    const params = { q: term, has_image: 1, cc0: 1, limit: 20, fields: FIELDS };
    return this.http
      .get<ApiResponse<Artwork[]>>(API_URL, { params })
      .pipe(map((response) => response.data));
  }
}