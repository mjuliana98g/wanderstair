import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MuseumService } from '../../services/museum';
import { MemoriesService } from '../../services/memories';
import { Artwork } from '../../models/artwork.model';
import { Memory } from '../../models/memory.model';

// --------------------------------------------------
// ARTWORK DETAIL PAGE
// --------------------------------------------------

@Component({
  selector: 'app-artwork-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './artwork-detail.html',
  styleUrl: './artwork-detail.css'
})
export class ArtworkDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private museumService = inject(MuseumService);
  private memoriesService = inject(MemoriesService);

  artwork = signal<Artwork | null>(null);
  loading = signal(true);
  error = signal('');
  memories = signal<Memory[]>([]);
  roomId = '';
  message = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArtwork(id);
    this.loadMemories();
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
      error: () => this.message.set('Your rooms could not be loaded. Is the API running?')
    });
  }

  artistName(artwork: Artwork): string {
    return artwork.creators[0]?.description ?? 'Unknown artist';
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
    this.message.set(`Hung in "${saved.title}".`);
  }
}