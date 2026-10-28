import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { MemoriesService } from '../../services/memories';
import { MuseumService } from '../../services/museum';
import { FriendsService } from '../../services/friends';
import { PostcardsService } from '../../services/postcards';
import { AuthService } from '../../services/auth';
import { Memory } from '../../models/memory.model';
import { Artwork } from '../../models/artwork.model';
import { Friend } from '../../models/friend.model';
import { Postcard } from '../../components/postcard/postcard';

// --------------------------------------------------
// SEND POSTCARD PAGE
// --------------------------------------------------

@Component({
  selector: 'app-send-postcard',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, Postcard],
  templateUrl: './send-postcard.html',
  styleUrl: './send-postcard.css'
})
export class SendPostcard implements OnInit {
  private route = inject(ActivatedRoute);
  private memoriesService = inject(MemoriesService);
  private museumService = inject(MuseumService);
  private friendsService = inject(FriendsService);
  private postcardsService = inject(PostcardsService);
  private auth = inject(AuthService);

  memoryId = Number(this.route.snapshot.paramMap.get('id'));
  artworkId = Number(this.route.snapshot.paramMap.get('artworkId'));

  memory = signal<Memory | null>(null);
  artwork = signal<Artwork | null>(null);
  friends = signal<Friend[]>([]);
  receivedBy = signal<string[]>([]);
  loading = signal(true);
  error = signal('');

  form = new FormGroup({
    friend: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(280)] }),
  });
  sending = signal(false);
  sendError = signal('');
  sentTo = signal('');

  ngOnInit(): void {
    forkJoin({
      memory: this.memoriesService.getById(this.memoryId),
      artwork: this.museumService.getById(this.artworkId),
      friends: this.friendsService.getAll().pipe(map((list) => list.filter((friend) => friend.status === 'accepted'))),
      received: this.postcardsService.recipientsOf(this.artworkId),
    }).subscribe({
      next: ({ memory, artwork, friends, received }) => {
        this.memory.set(memory);
        this.artwork.set(artwork);
        this.friends.set(friends);
        this.receivedBy.set(received);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This postcard could not be prepared. Try again later.');
        this.loading.set(false);
      },
    });
  }

  // --------------------------------------------------
  // FRIENDS
  // --------------------------------------------------

  available(): Friend[] {
    return this.friends().filter((friend) => !this.receivedBy().includes(friend.id));
  }

  alreadySent(): string {
    const names = this.friends().filter((friend) => this.receivedBy().includes(friend.id)).map((friend) => friend.name);
    return new Intl.ListFormat('en', { type: 'conjunction' }).format(names);
  }

  myName(): string {
    return this.auth.user()?.user_metadata['name'] ?? '';
  }

  chosenName(): string {
    const id = this.form.controls.friend.value;
    return id ? this.friendName(id) : '…';
  }

  private friendName(id: string): string {
    return this.friends().find((friend) => friend.id === id)?.name ?? 'your friend';
  }

  // --------------------------------------------------
  // SEND
  // --------------------------------------------------

  sendPostcard(): void {
    const memory = this.memory();
    if (!memory || this.form.invalid) return;
    const { friend, message } = this.form.getRawValue();
    this.sending.set(true);
    this.sendError.set('');
    this.postcardsService.create({
      recipientId: friend,
      memoryId: memory.id,
      artworkId: this.artworkId,
      message: message.trim(),
      memoryTitle: memory.title,
      memoryDate: memory.date,
      moods: memory.moods,
    }).subscribe({
      next: () => this.sentTo.set(this.friendName(friend)),
      error: (error: { code?: string }) => {
        this.sendError.set(error.code === '23505' ? 'You already sent this painting to this friend.' : 'The postcard could not be sent. Try again.');
        this.sending.set(false);
      },
    });
  }
}