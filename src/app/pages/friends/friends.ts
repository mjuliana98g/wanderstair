import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs';

import { FriendsService } from '../../services/friends';
import { AuthService } from '../../services/auth';
import { Friend } from '../../models/friend.model';

// --------------------------------------------------
// FRIENDS PAGE
// --------------------------------------------------

@Component({
  selector: 'app-friends',
  imports: [ReactiveFormsModule],
  templateUrl: './friends.html',
  styleUrl: './friends.css'
})
export class Friends implements OnInit {
  private friendsService = inject(FriendsService);
  private auth = inject(AuthService);

  friends = signal<Friend[]>([]);
  loading = signal(true);
  error = signal('');

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });
  sending = signal(false);
  message = signal('');
  formError = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.friendsService.getAll().subscribe({
      next: (friends) => {
        this.friends.set(friends);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Your friends could not be loaded. Try again later.');
        this.loading.set(false);
      },
    });
  }

  received(): Friend[] {
    return this.friends().filter((friend) => friend.status === 'pending' && !friend.sentByMe);
  }

  accepted(): Friend[] {
    return this.friends().filter((friend) => friend.status === 'accepted');
  }

  sent(): Friend[] {
    return this.friends().filter((friend) => friend.status === 'pending' && friend.sentByMe);
  }

  // --------------------------------------------------
  // ADD A FRIEND
  // --------------------------------------------------

  addFriend(): void {
    if (this.form.invalid) return;
    const email = this.form.controls.email.value.trim();
    this.message.set('');
    this.formError.set('');
    if (email.toLowerCase() === this.auth.user()?.email?.toLowerCase()) {
      this.formError.set('That is your own email.');
      return;
    }
    this.sending.set(true);
    this.friendsService.findByEmail(email).pipe(
      switchMap((profile) => {
        if (!profile) throw new Error('not-found');
        return this.friendsService.ask(profile.id).pipe(map(() => profile));
      }),
    ).subscribe({
      next: (profile) => {
        this.message.set(`Request sent to ${profile.name}.`);
        this.form.reset();
        this.sending.set(false);
        this.load();
      },
      error: (error: { message?: string; code?: string }) => {
        this.formError.set(this.messageFor(error));
        this.sending.set(false);
      },
    });
  }

  private messageFor(error: { message?: string; code?: string }): string {
    if (error.message === 'not-found') return 'No account uses this email.';
    if (error.code === '23505') return 'You already have a request with this person.';
    return 'The request could not be sent. Try again.';
  }

  // --------------------------------------------------
  // ANSWER AND REMOVE
  // --------------------------------------------------

  accept(friend: Friend): void {
    this.friendsService.accept(friend.friendshipId).subscribe({
      next: () => this.load(),
      error: () => this.error.set('The request could not be accepted. Try again.'),
    });
  }

  remove(friend: Friend): void {
    this.friendsService.remove(friend.friendshipId).subscribe({
      next: () => this.load(),
      error: () => this.error.set('This could not be done. Try again.'),
    });
  }
}