import { Service, inject, signal } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';

import { SupabaseService } from './supabase-service';
import { send } from './send';
import { NewPostcard, Postcard } from '../models/postcard.model';
import { Mood } from '../models/memory.model';
import { Profile } from '../models/friend.model';

const COLUMNS = 'id, created_at, read_at, memory_id, artwork_id, message, memory_title, memory_date, moods, sender_id, recipient_id, sender:profiles!postcards_sender_id_fkey(id, name), recipient:profiles!postcards_recipient_id_fkey(id, name)';

interface PostcardRow {
  id: number;
  created_at: string;
  read_at: string | null;
  memory_id: number;
  artwork_id: number;
  message: string;
  memory_title: string;
  memory_date: string;
  moods: string[];
  sender_id: string;
  recipient_id: string;
  sender: Profile;
  recipient: Profile;
}

// --------------------------------------------------
// POSTCARDS SERVICE
// --------------------------------------------------

@Service()
export class PostcardsService {
  private supabase = inject(SupabaseService).supabaseClient;

  unread = signal(0);

  create(postcard: NewPostcard): Observable<number> {
    const row = {
      recipient_id: postcard.recipientId,
      memory_id: postcard.memoryId,
      artwork_id: postcard.artworkId,
      message: postcard.message,
      memory_title: postcard.memoryTitle,
      memory_date: postcard.memoryDate,
      moods: postcard.moods,
    };
    const request = this.supabase.from('postcards').insert(row).select('id').single();
    return send(request).pipe(map((saved) => saved.id));
  }

  recipientsOf(artworkId: number): Observable<string[]> {
    const request = this.supabase.from('postcards').select('recipient_id').eq('artwork_id', artworkId);
    return send(request).pipe(map((rows) => rows.map((row) => row.recipient_id)));
  }

  getAll(): Observable<Postcard[]> {
    return this.me().pipe(
      switchMap((me) => {
        const request = this.supabase.from('postcards').select(COLUMNS).order('created_at', { ascending: false });
        return send(request).pipe(map((rows) => rows.map((row) => toPostcard(row, me))));
      }),
    );
  }

  getById(id: number): Observable<Postcard> {
    return this.me().pipe(
      switchMap((me) => {
        const request = this.supabase.from('postcards').select(COLUMNS).eq('id', id).single();
        return send(request).pipe(map((row) => toPostcard(row, me)));
      }),
    );
  }

  markRead(id: number): Observable<void> {
    const request = this.supabase.from('postcards').update({ read_at: new Date().toISOString() }).eq('id', id).select('id');
    return send(request).pipe(map(() => undefined));
  }

  refreshUnread(): void {
    this.me().pipe(
      switchMap((me) => send(this.supabase.from('postcards').select('id').eq('recipient_id', me).is('read_at', null))),
    ).subscribe({
      next: (rows) => this.unread.set(rows.length),
      error: () => this.unread.set(0),
    });
  }

  private me(): Observable<string> {
    return from(this.supabase.auth.getSession()).pipe(map(({ data }) => data.session?.user.id ?? ''));
  }
}

function toPostcard(row: PostcardRow, me: string): Postcard {
  return {
    id: row.id,
    createdAt: row.created_at,
    readAt: row.read_at,
    recipientId: row.recipient_id,
    memoryId: row.memory_id,
    artworkId: row.artwork_id,
    message: row.message,
    memoryTitle: row.memory_title,
    memoryDate: row.memory_date,
    moods: row.moods as Mood[],
    sender: row.sender,
    recipient: row.recipient,
    sentByMe: row.sender_id === me,
  };
}