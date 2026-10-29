import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, forkJoin, switchMap } from 'rxjs';

import { PostcardsService } from '../../services/postcards';
import { GiftsService } from '../../services/gifts';
import { MuseumService } from '../../services/museum';
import { NewPostcard, Postcard } from '../../models/postcard.model';
import { Artwork } from '../../models/artwork.model';
import { familyOf } from '../../models/moods';

const DEFAULT_ANSWER = 'A painting for your day.';

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
        const reason = this.cannotAnswer(postcard);
        if (reason) this.error.set(reason);
        this.postcard.set(postcard);
        this.answered.set(gift !== null);
        this.loading.set(false);
        this.loadPostcardArtwork(postcard.artworkId);
      },
      error: () => {
        this.error.set('This postcard could not be found.');
        this.loading.set(false);
      },
    });
  }

  private loadPostcardArtwork(artworkId: number): void {
    this.museumService.getById(artworkId).subscribe((artwork) => this.postcardArtwork.set(artwork));
  }

  private cannotAnswer(postcard: Postcard): string {
    if (postcard.sentByMe) return 'Only the person who received this postcard can answer it.';
    if (postcard.replyTo) return 'This postcard is already an answer, so it cannot be answered.';
    return '';
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
    this.sendAnswer(postcard, artwork).subscribe({
      next: () => this.answered.set(true),
      error: (error: { code?: string; message?: string }) => {
        this.sendError.set(this.answerError(error));
        this.sending.set(false);
      },
    });
  }

  private sendAnswer(postcard: Postcard, artwork: Artwork): Observable<number> {
    const note = this.answerForm.controls.note.value.trim();
    return this.postcardsService.create(this.answerPostcard(postcard, artwork, note)).pipe(
      switchMap(() => this.giftsService.create({
        postcardId: postcard.id,
        memoryId: postcard.memoryId,
        artworkId: artwork.id,
        note,
      })),
    );
  }

  private answerPostcard(postcard: Postcard, artwork: Artwork, note: string): NewPostcard {
    return {
      recipientId: postcard.sender.id,
      memoryId: postcard.memoryId,
      artworkId: artwork.id,
      message: note || DEFAULT_ANSWER,
      memoryTitle: postcard.memoryTitle,
      memoryDate: postcard.memoryDate,
      moods: postcard.moods,
      replyTo: postcard.id,
    };
  }

  private answerError(error: { code?: string; message?: string }): string {
    if (error.code !== '23505') return 'The painting could not be sent. Try again.';
    if (error.message?.includes('postcards_once')) return 'You already sent this painting to them. Choose another one.';
    return 'You already answered this postcard.';
  }
}