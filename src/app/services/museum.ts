import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';

import { ApiResponse, Artwork } from '../models/artwork.model';

const API_URL = 'https://openaccess-api.clevelandart.org/api/artworks';
const FIELDS = 'id,title,creation_date,type,technique,department,description,url,creators,images';

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
    if (!ids.length) return of([]);
    return forkJoin(ids.map((id) => this.getById(id)));
  }

  search(term: string): Observable<Artwork[]> {
    const params = { q: term, has_image: 1, cc0: 1, limit: 20, fields: FIELDS };
    return this.http
      .get<ApiResponse<Artwork[]>>(API_URL, { params })
      .pipe(map((response) => response.data));
  }

  // PORTRAIT OF THE DAY

  getPortraitOfTheDay(): Observable<Artwork | undefined> {
    const params = {
      q: 'portrait',
      type: 'Painting',
      has_image: 1,
      cc0: 1,
      limit: 1,
      skip: this.dayOfYear() % 100,
      fields: FIELDS,
    };
    return this.http
      .get<ApiResponse<Artwork[]>>(API_URL, { params })
      .pipe(map((response) => response.data[0]));
  }

  private dayOfYear(): number {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), 0, 0);
    return Math.floor((today.getTime() - firstDay.getTime()) / 86400000);
  }
}