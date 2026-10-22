import { Service, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';

import { SupabaseService } from './supabase-service';
import { DoorOption, DoorStyle, Memory, Mood, MoodOption, NewMemory } from '../models/memory.model';

const COLUMNS = 'id, title, date, text, artworks, mood:moods(name), door:doors(name)'

interface MemoryRow {
  id: number;
  title: string;
  date: string;
  text: string;
  artworks: number[];
  mood: { name: string };
  door: { name: string };
}

// --------------------------------------------------
// MEMORIES SERVICE
// --------------------------------------------------

@Service()
export class MemoriesService {
  private supabase = inject(SupabaseService).supabaseClient;

  getAll(): Observable<Memory[]> {
    const request = this.supabase.from('memories').select(COLUMNS);
    return this.send(request).pipe(map((rows) => rows.map(toMemory)));
  }

  getById(id: number): Observable<Memory> {
    const request = this.supabase.from('memories').select(COLUMNS).eq('id', id).single();
    return this.send(request).pipe(map(toMemory));
  }

  create(memory: NewMemory): Observable<Memory> {
    const row = { title: memory.title, date: memory.date, text: memory.text, mood_id: memory.moodId, door_id: memory.doorId };
    const request = this.supabase.from('memories').insert(row).select(COLUMNS).single();
    return this.send(request).pipe(map(toMemory));
  }

  updateArtworks(id: number, artworks: number[]): Observable<Memory> {
    const request = this.supabase.from('memories').update({ artworks }).eq('id', id).select(COLUMNS).single();
    return this.send(request).pipe(map(toMemory));
  }

  remove(id: number): Observable<unknown> {
    const request = this.supabase.from('memories').delete().eq('id', id).select('id');
    return this.send(request);
  }

  // --------------------------------------------------
  // MOODS AND DOORS
  // --------------------------------------------------

  getMoods(): Observable<MoodOption[]> {
    const request = this.supabase.from('moods').select('id, name, family').order('id');
    return this.send(request);
  }

  getDoors(): Observable<DoorOption[]> {
    const request = this.supabase.from('doors').select('id, name, description').order('id');
    return this.send(request);
  }

  // --------------------------------------------------
  // SUPABASE ANSWERS
  // --------------------------------------------------

  private send<T>(request: PromiseLike<{ data: T | null; error: unknown }>): Observable<T> {
    return from(request).pipe(
      map(({ data, error }) => {
        if (error || data === null) throw error;
        return data;
      })
    );
  }
}

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    text: row.text,
    artworks: row.artworks,
    mood: row.mood.name as Mood,
    door: row.door.name as DoorStyle
  };
}