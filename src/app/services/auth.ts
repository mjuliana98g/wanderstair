import { Service, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Observable, from, map } from 'rxjs';

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

    hasSession(): Promise<boolean> {
    return this.supabase.auth.getSession().then(({ data }) => !!data.session);
  }
  
}