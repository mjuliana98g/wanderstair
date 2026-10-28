import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PostcardsService } from '../../services/postcards';
import { GiftsService } from '../../services/gifts';
import { MuseumService } from '../../services/museum';
import { Postcard } from '../../models/postcard.model';
import { Artwork } from '../../models/artwork.model';
import { familyOf } from '../../models/moods';

// --------------------------------------------------
// ANSWER POSTCARD PAGE
// --------------------------------------------------

@Component({
  selector: 'app-answer-postcard',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './answer-postcard.html',
  styleUrl: './answer-postcard.css'
})
export class AnswerPostcard implements OnInit {
  private route = inject(ActivatedRoute);
  private postcardsService = inject(PostcardsService);
  private giftsService = inject(GiftsService);
  private museumService = inject(MuseumService);

  familyOf = familyOf;
  postcardId = Number(this.route.snapshot.paramMap.get('id'));
  postcard = signal<Postcard | null>(null);
  postcardArtwork = signal<Artwork | null>(null);
  loading = signal(true);
  error = signal('');
  answered = signal(false);

  searchForm = new FormGroup({
    term: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  results = signal<Artwork[]>([]);
  searching = signal(false);
  searchError = signal('');
  chosen = signal<Artwork | null>(null);

  answerForm = new FormGroup({
    note: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(120)] }),
  });
  sending = signal(false);
  sendError = signal('');

  ngOnInit(): void {
    forkJoin({
      postcard: this.postcardsService.getById(this.postcardId),
      gift: this.giftsService.forPostcard(this.postcardId),
    }).subscribe({
      next: ({ postcard, gift }) => {
        if (postcard.sentByMe) this.error.set('Only the person who received this postcard can answer it.');
        this.postcard.set(postcard);
        this.museumService.getById(postcard.artworkId).subscribe((artwork) => this.postcardArtwork.set(artwork));
        this.answered.set(gift !== null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This postcard could not be found.');
        this.loading.set(false);
      },
    });
  }

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  search(): void {
    const term = this.searchForm.controls.term.value.trim();
    if (!term) return;
    this.searching.set(true);
    this.searchError.set('');
    this.museumService.search(term).subscribe({
      next: (artworks) => {
        this.results.set(artworks.filter((artwork) => artwork.images));
        this.searching.set(false);
      },
      error: () => {
        this.searchError.set('The museum could not be searched. Try again.');
        this.searching.set(false);
      },
    });
  }

  choose(artwork: Artwork): void {
    this.chosen.set(artwork);
  }

  // --------------------------------------------------
  // ANSWER
  // --------------------------------------------------

  answer(): void {
    const postcard = this.postcard();
    const artwork = this.chosen();
    if (!postcard || !artwork || this.answerForm.invalid) return;
    this.sending.set(true);
    this.sendError.set('');
    this.giftsService.create({
      postcardId: postcard.id,
      memoryId: postcard.memoryId,
      artworkId: artwork.id,
      note: this.answerForm.controls.note.value.trim(),
    }).subscribe({
      next: () => this.answered.set(true),
      error: (error: { code?: string }) => {
        this.sendError.set(error.code === '23505' ? 'You already answered this postcard.' : 'The painting could not be sent. Try again.');
        this.sending.set(false);
      },
    });
  }
}