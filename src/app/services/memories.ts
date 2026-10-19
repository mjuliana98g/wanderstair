import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Memory, NewMemory } from '../models/memory.model';

// --------------------------------------------------
// MEMORIES SERVICE
// --------------------------------------------------

@Injectable({ providedIn: 'root' })
export class MemoriesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/memories';

  getAll(): Observable<Memory[]> {
    return this.http.get<Memory[]>(this.apiUrl);
  }

  getById(id: string): Observable<Memory> {
    return this.http.get<Memory>(`${this.apiUrl}/${id}`);
  }

  create(memory: NewMemory): Observable<Memory> {
    return this.http.post<Memory>(this.apiUrl, memory);
  }

  update(memory: Memory): Observable<Memory> {
    return this.http.put<Memory>(`${this.apiUrl}/${memory.id}`, memory);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}