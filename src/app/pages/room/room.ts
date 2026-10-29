import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { MemoriesService } from '../../services/memories';
import { MuseumService } from '../../services/museum';
import { GiftsService } from '../../services/gifts';
import { Memory } from '../../models/memory.model';
import { Artwork } from '../../models/artwork.model';
import { Gift, HungGift } from '../../models/gift.model';
import { familyOf } from '../../models/moods';
import { Frame } from '../../components/frame/frame';

@Component({
  selector: 'app-room',
  imports: [DatePipe, RouterLink, Frame],
  templateUrl: './room.html',
  styleUrl: './room.css'
})
export class Room implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private memoriesService = inject(MemoriesService);
  private museumService = inject(MuseumService);
  private giftsService = inject(GiftsService);

  familyOf = familyOf;
  id = Number(this.route.snapshot.paramMap.get('id'));

  memory = signal<Memory | null>(null);
  loading = signal(true);
  error = signal('');

  artworks = signal<Artwork[]>([]);
  artworksLoading = signal(false);
  artworksError = signal('');
  gifts = signal<HungGift[]>([]);

  confirmingClose = signal(false);
  closing = signal(false);
  deleteError = signal('');

  ngOnInit(): void {
    this.memoriesService.getById(this.id).subscribe({
      next: (memory) => {
        this.memory.set(memory);
        this.loading.set(false);
        this.loadArtworks(memory.artworks);
      },
      error: () => {
        this.error.set('This door does not open. The room may not exist.');
        this.loading.set(false);
      },
    });
    this.loadGifts(this.id);
  }

  // EXHIBITION

  private loadArtworks(ids: number[]): void {
    this.artworksLoading.set(true);
    this.artworksError.set('');
    this.museumService.getByIds(ids).subscribe({
      next: (artworks) => {
        this.artworks.set(artworks);
        this.artworksLoading.set(false);
      },
      error: () => {
        this.artworksError.set('The paintings could not be hung. Try again later.');
        this.artworksLoading.set(false);
      },
    });
  }

  takeOffWall(artwork: Artwork): void {
    const memory = this.memory();
    if (!memory) return;
    const remaining = memory.artworks.filter((id) => id !== artwork.id);
    this.memoriesService.updateArtworks(memory.id, remaining).subscribe({
      next: (saved) => {
        this.memory.set(saved);
        this.artworks.update((list) => list.filter((hung) => hung.id !== artwork.id));
      },
      error: () => this.artworksError.set('The painting could not be taken down. Try again.'),
    });
  }

  // GIFTS (POSTCARDS)

  private loadGifts(memoryId: number): void {
    this.giftsService.forMemory(memoryId).pipe(switchMap((gifts) => this.withArtworks(gifts))).subscribe({
      next: (hung) => this.gifts.set(hung),
      error: () => this.gifts.set([]),
    });
  }

  private withArtworks(gifts: Gift[]): Observable<HungGift[]> {
    if (!gifts.length) return of([]);
    return forkJoin(gifts.map((gift) => this.museumService.getById(gift.artworkId).pipe(map((artwork) => ({ gift, artwork })))));
  }

  takeDown(gift: Gift): void {
    this.giftsService.remove(gift.id).subscribe({
      next: () => this.gifts.update((list) => list.filter((hung) => hung.gift.id !== gift.id)),
      error: () => this.artworksError.set('The painting could not be taken down. Try again.'),
    });
  }

  // DELETE THE DOOR/MEMORY

  deleteMemory(): void {
    this.closing.set(true);
    this.deleteError.set('');
    this.memoriesService.remove(this.id).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.deleteError.set('The door could not be closed. Try again.');
        this.closing.set(false);
      },
    });
  }
}