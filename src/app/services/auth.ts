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

    private checkPassword(password: string): Observable<void> {
        const email = this.user()?.email ?? '';
        const request = this.supabase.auth.signInWithPassword({ email, password });
        return from(request).pipe(map(({ error }) => {
            if (error) throw new Error('wrong-password');
        }));
    }

    changePassword(current: string, password: string): Observable<void> {
        return this.checkPassword(current).pipe(
            switchMap(() => from(this.supabase.auth.updateUser({ password }))),
            map(({ error }) => { if (error) throw error; }),
        );
    }

    deleteAccount(password: string): Observable<void> {
        return this.checkPassword(password).pipe(
            switchMap(() => from(this.supabase.rpc('delete_my_account'))),
            switchMap(({ error }) => {
                if (error) throw error;
                return from(this.supabase.auth.signOut({ scope: 'local' }));
            }),
            map(() => undefined),
        );
    }

    hasSession(): Promise<boolean> {
        return this.supabase.auth.getSession().then(({ data }) => !!data.session);
    }
}