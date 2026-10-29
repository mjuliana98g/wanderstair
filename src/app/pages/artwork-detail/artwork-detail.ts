import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MuseumService } from '../../services/museum';
import { MemoriesService } from '../../services/memories';
import { Artwork } from '../../models/artwork.model';
import { Memory } from '../../models/memory.model';
import { Location } from '@angular/common';
import { Frame } from '../../components/frame/frame';
import { GiftsService } from '../../services/gifts';
import { GiftedArtwork } from '../../models/gift.model';

// --------------------------------------------------
// ARTWORK DETAIL PAGE
// --------------------------------------------------

@Component({
  selector: 'app-artwork-detail',
  imports: [FormsModule, Frame],
  templateUrl: './artwork-detail.html',
  styleUrl: './artwork-detail.css'
})
export class ArtworkDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private museumService = inject(MuseumService);
  private memoriesService = inject(MemoriesService);
  private router = inject(Router);
  private location = inject(Location);
  private giftsService = inject(GiftsService);

  artwork = signal<Artwork | null>(null);
  loading = signal(true);
  error = signal('');
  memories = signal<Memory[]>([]);
  roomId = '';
  message = signal('');
  inModal = this.router.url.startsWith('/find');
  gifted = signal<GiftedArtwork[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.roomId = this.route.snapshot.queryParamMap.get('room') ?? '';
    this.loadArtwork(id);
    this.loadMemories();
    this.giftsService.hungArtworks().subscribe((gifted) => this.gifted.set(gifted));
  }

  loadArtwork(id: number): void {
    this.museumService.getById(id).subscribe({
      next: (artwork) => {
        this.artwork.set(artwork);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This painting has left the museum.');
        this.loading.set(false);
      }
    });
  }

  loadMemories(): void {
    this.memoriesService.getAll().subscribe({
      next: (memories) => this.memories.set(memories),
      error: () => this.message.set('Your rooms could not be loaded. Try again later.')
    });
  }

  artistName(artwork: Artwork): string {
    return artwork.creators[0]?.description ?? 'Unknown artist';
  }

  shortName(artwork: Artwork): string {
    return this.artistName(artwork).split(' (')[0];
  }

  goBack(): void {
    this.location.back();
  }

  private hangsIn(memory: Memory, artwork: Artwork): boolean {
    const chosen = memory.artworks.includes(artwork.id);
    const gifted = this.gifted().some((pair) => pair.memoryId === memory.id && pair.artworkId === artwork.id);
    return chosen || gifted;
  }

  roomsWith(artwork: Artwork): Memory[] {
    return this.memories().filter((memory) => this.hangsIn(memory, artwork));
  }

  roomsWithout(artwork: Artwork): Memory[] {
    return this.memories().filter((memory) => !this.hangsIn(memory, artwork));
  }

  hungIn(artwork: Artwork): string {
    const titles = this.roomsWith(artwork).map((memory) => memory.title);
    return new Intl.ListFormat('en', { type: 'conjunction' }).format(titles);
  }

  // --------------------------------------------------
  // HANGING
  // --------------------------------------------------

  hang(artwork: Artwork): void {
    const room = this.memories().find((memory) => memory.id === Number(this.roomId));
    if (!room) return;
    if (room.artworks.includes(artwork.id)) {
      this.message.set('This painting is already in that room.');
      return;
    }
    this.memoriesService.updateArtworks(room.id, [...room.artworks, artwork.id]).subscribe({
      next: (saved) => this.saveRoom(saved),
      error: () => this.message.set('The painting could not be hung. Try again.')
    });
  }

  private saveRoom(saved: Memory): void {
    this.memories.update((list) => list.map((memory) => (memory.id === saved.id ? saved : memory)));
    this.message.set('');
    this.roomId = '';
  }
}