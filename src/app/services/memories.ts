import { Service, inject } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';

import { SupabaseService } from './supabase-service';
import { DoorOption, DoorStyle, Memory, Mood, MoodOption, NewMemory } from '../models/memory.model';

const COLUMNS = 'id, title, date, text, artworks, door:doors(name), moods:memory_moods(position, mood:moods(name))';

interface MoodLink {
  position: number;
  mood: { name: string };
}

interface MemoryRow {
  id: number;
  title: string;
  date: string;
  text: string;
  artworks: number[];
  moods: MoodLink[];
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
    const row = { title: memory.title, date: memory.date, text: memory.text, door_id: memory.doorId };
    const request = this.supabase.from('memories').insert(row).select('id').single();

    return this.send(request).pipe(
      switchMap((saved) => this.saveMoods(saved.id, memory.moodIds)),
      switchMap((id) => this.getById(id))
    );
  }

  private saveMoods(memoryId: number, moodIds: number[]): Observable<number> {
    const rows = moodIds.map((moodId, index) => ({ memory_id: memoryId, mood_id: moodId, position: index + 1 }));
    const request = this.supabase.from('memory_moods').insert(rows).select('memory_id');
    return this.send(request).pipe(map(() => memoryId));
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
    moods: sortMoods(row.moods),
    door: row.door.name as DoorStyle
  };
}

function sortMoods(links: MoodLink[]): Mood[] {
  return [...links]
    .sort((a, b) => a.position - b.position)
    .map((link) => link.mood.name as Mood)
}