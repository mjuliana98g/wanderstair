import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { PostcardsService } from '../../services/postcards';
import { MuseumService } from '../../services/museum';
import { Postcard } from '../../models/postcard.model';
import { Artwork } from '../../models/artwork.model';
import { Frame } from '../../components/frame/frame';

@Component({
  imports: [RouterLink, Frame],
  selector: 'app-postcard-view',
  styleUrl: './postcard-view.css',
  templateUrl: './postcard-view.html',
})
export class PostcardView implements OnInit {
  private route = inject(ActivatedRoute);
  private postcardsService = inject(PostcardsService);
  private museumService = inject(MuseumService);

  postcard = signal<Postcard | null>(null);
  artwork = signal<Artwork | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.postcardsService.getById(id).pipe(
      switchMap((postcard) => this.museumService.getById(postcard.artworkId).pipe(map((artwork) => ({ postcard, artwork })))),
    ).subscribe({
      next: ({ postcard, artwork }) => {
        this.postcard.set(postcard);
        this.artwork.set(artwork);
        this.loading.set(false);
        if (!postcard.sentByMe && !postcard.readAt) this.markRead(postcard);
      },
      error: () => {
        this.error.set('This postcard could not be found.');
        this.loading.set(false);
      },
    });
  }

  private markRead(postcard: Postcard): void {
    this.postcardsService.markRead(postcard.id).subscribe({
      next: () => this.postcardsService.refreshUnread(),
      error: () => {},
    });
  }
}
