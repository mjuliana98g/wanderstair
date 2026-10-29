import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PostcardsService } from '../../services/postcards';
import { Postcard } from '../../models/postcard.model';
import { familyOf } from '../../models/moods';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-postcards',
  styleUrl: './postcards.css',
  templateUrl: './postcards.html',
})
export class Postcards implements OnInit {
  private postcardsService = inject(PostcardsService);

  familyOf = familyOf;
  postcards = signal<Postcard[]>([]);
  loading = signal(true);
  error = signal('');
  tab = signal<'received' | 'sent'>('received');

  ngOnInit(): void {
    this.postcardsService.getAll().subscribe({
      next: (postcards) => {
        this.postcards.set(postcards);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Your postcards could not be loaded. Try again later.');
        this.loading.set(false);
      },
    });
  }

  received(): Postcard[] {
    return this.postcards().filter((postcard) => !postcard.sentByMe);
  }

  sent(): Postcard[] {
    return this.postcards().filter((postcard) => postcard.sentByMe);
  }

  shown(): Postcard[] {
    return this.tab() === 'received' ? this.received() : this.sent();
  }

  isNew(postcard: Postcard): boolean {
    return !postcard.sentByMe && !postcard.readAt;
  }
}