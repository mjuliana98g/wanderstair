import { Service, inject } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';

import { SupabaseService } from './supabase-service';
import { send } from './send';
import { Friend, FriendshipStatus, Profile } from '../models/friend.model';

const COLUMNS = 'id, status, requester_id, requester:profiles!friendships_requester_id_fkey(id, name), addressee:profiles!friendships_addressee_id_fkey(id, name)';

interface FriendshipRow {
    id: number;
    status: string;
    requester_id: string;
    requester: Profile;
    addressee: Profile;
}

// --------------------------------------------------
// FRIENDS SERVICE
// --------------------------------------------------

@Service()
export class FriendsService {
    private supabase = inject(SupabaseService).supabaseClient;

    getAll(): Observable<Friend[]> {
        return from(this.supabase.auth.getSession()).pipe(
            switchMap(({ data }) => {
                const me = data.session?.user.id ?? '';
                const request = this.supabase.from('friendships').select(COLUMNS).order('created_at');
                return send(request).pipe(map((rows) => rows.map((row) => toFriend(row, me))));
            }),
        );
    }

    findByEmail(email: string): Observable<Profile | null> {
        const request = this.supabase.rpc('find_profile_by_email', { target: email });
        return send(request).pipe(map((profiles) => profiles[0] ?? null));
    }

    ask(profileId: string): Observable<void> {
        const request = this.supabase.from('friendships').insert({ addressee_id: profileId }).select('id');
        return send(request).pipe(map(() => undefined));
    }

    accept(friendshipId: number): Observable<void> {
        const request = this.supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId).select('id');
        return send(request).pipe(map(() => undefined));
    }

    remove(friendshipId: number): Observable<void> {
        const request = this.supabase.from('friendships').delete().eq('id', friendshipId).select('id');
        return send(request).pipe(map(() => undefined));
    }
}

function toFriend(row: FriendshipRow, me: string): Friend {
    const sentByMe = row.requester_id === me;
    const other = sentByMe ? row.addressee : row.requester;
    return { friendshipId: row.id, id: other.id, name: other.name, status: row.status as FriendshipStatus, sentByMe };
}
