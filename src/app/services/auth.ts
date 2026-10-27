import { Service, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Observable, from, map, switchMap } from 'rxjs';

import { SupabaseService } from './supabase-service';

// --------------------------------------------------
// AUTH SERVICE
// --------------------------------------------------

@Service()
export class AuthService {
    private supabase = inject(SupabaseService).supabaseClient;
    user = signal<User | null>(null);

    constructor() {
        this.supabase.auth.onAuthStateChange((_event, session) => this.user.set(session?.user ?? null));

    }

    signUp(name: string, email: string, password: string): Observable<void> {
        const request = this.supabase.auth.signUp({ email, password, options: { data: { name } } });
        return from(request).pipe(map(({ error }) => { if (error) throw error; }));
    }

    signIn(email: string, password: string): Observable<void> {
        const request = this.supabase.auth.signInWithPassword({ email, password });
        return from(request).pipe(map(({ error }) => { if (error) throw error; }));
    }

    signOut(): Observable<void> {
        return from(this.supabase.auth.signOut()).pipe(map(({ error }) => { if (error) throw error; }));
    }

    updateName(name: string): Observable<void> {
        const request = this.supabase.auth.updateUser({ data: { name } });
        return from(request).pipe(map(({ error }) => {
            if (error) throw error;
        }));
    }

    changePassword(current: string, password: string): Observable<void> {
        const email = this.user()?.email ?? '';
        const check = this.supabase.auth.signInWithPassword({ email, password: current });
        return from(check).pipe(
            switchMap(({ error }) => {
                if (error) throw new Error('wrong-password');
                return from(this.supabase.auth.updateUser({ password }));
            }),
            map(({ error }) => { if (error) throw error; })
        )
    }

    hasSession(): Promise<boolean> {
        return this.supabase.auth.getSession().then(({ data }) => !!data.session);
    }
}