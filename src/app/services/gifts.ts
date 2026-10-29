import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { SupabaseService } from './supabase-service';
import { send } from './send';
import { Gift, NewGift } from '../models/gift.model';
import { Profile } from '../models/friend.model';

const COLUMNS = 'id, created_at, postcard_id, memory_id, artwork_id, note, giver:profiles!gifts_giver_id_fkey(id, name)';

interface GiftRow {
    id: number;
    created_at: string;
    postcard_id: number;
    memory_id: number;
    artwork_id: number;
    note: string;
    giver: Profile;
}
// GIFTS SERVICE

@Service()
export class GiftsService {
    private supabase = inject(SupabaseService).supabaseClient;

    create(gift: NewGift): Observable<number> {
        const row = {
            postcard_id: gift.postcardId,
            memory_id: gift.memoryId,
            artwork_id: gift.artworkId,
            note: gift.note,
        };
        const request = this.supabase.from('gifts').insert(row).select('id').single();
        return send(request).pipe(map((saved) => saved.id));
    }

    forMemory(memoryId: number): Observable<Gift[]> {
        const request = this.supabase.from('gifts').select(COLUMNS).eq('memory_id', memoryId).order('created_at');
        return send(request).pipe(map((rows) => rows.map(toGift)));
    }

    forPostcard(postcardId: number): Observable<Gift | null> {
        const request = this.supabase.from('gifts').select(COLUMNS).eq('postcard_id', postcardId);
        return send(request).pipe(map((rows) => (rows[0] ? toGift(rows[0]) : null)));
    }

    remove(id: number): Observable<void> {
        const request = this.supabase.from('gifts').delete().eq('id', id).select('id');
        return send(request).pipe(map(() => undefined));
    }
}

function toGift(row: GiftRow): Gift {
    return {
        id: row.id,
        createdAt: row.created_at,
        postcardId: row.postcard_id,
        memoryId: row.memory_id,
        artworkId: row.artwork_id,
        note: row.note,
        giver: row.giver,
    };
}
