import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { SupabaseService } from './supabase-service';
import { send } from './send';
import { NewPostcard } from '../models/postcard.model';

// --------------------------------------------------
// POSTCARDS SERVICE
// --------------------------------------------------

@Service()
export class PostcardsService {
    private supabase = inject(SupabaseService).supabaseClient;

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

    
}
