import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { MemoriesService } from '../../services/memories';
import { MuseumService } from '../../services/museum';
import { Memory } from '../../models/memory.model';
import { Artwork } from '../../models/artwork.model';
import { Frame } from '../../components/frame/frame';
import { familyOf } from '../../models/moods';

// --------------------------------------------------
// ROOM PAGE
// --------------------------------------------------

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

  memory = signal<Memory | null>(null);
  loading = signal(true);
  error = signal('');
  familyOf = familyOf;

  artworks = signal<Artwork[]>([]);
  artworksLoading = signal(false);
  artworksError = signal('');
  deleteError = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMemory(id);
  }

  loadMemory(id: number): void {
    this.memoriesService.getById(id).subscribe({
      next: (memory) => {
        this.memory.set(memory);
        this.loading.set(false);
        this.loadArtworks(memory.artworks);
      },
      error: () => {
        this.error.set('This door does not exist.');
        this.loading.set(false);
      }
    });
  }

  // --------------------------------------------------
  // ARTWORKS
  // --------------------------------------------------

  loadArtworks(ids: number[]): void {
    if (ids.length === 0) return;
    this.artworksLoading.set(true);
    this.museumService.getByIds(ids).subscribe({
      next: (artworks) => {
        this.artworks.set(artworks);
        this.artworksLoading.set(false);
      },
      error: () => {
        this.artworksError.set('The paintings are asleep. The museum did not answer.');
        this.artworksLoading.set(false);
      }
    });
  }

  takeOffWall(artwork: Artwork): void {
    const memory = this.memory();
    if (!memory) return;
    const artworks = memory.artworks.filter((id) => id !== artwork.id);
    this.memoriesService.updateArtworks(memory.id, artworks).subscribe({
      next: (saved) => {
        this.memory.set(saved);
        this.artworks.update((list) => list.filter((item) => item.id !== artwork.id));
      },
      error: () => this.artworksError.set('The painting is stuck to the wall. Try again.')
    });
  }

  // --------------------------------------------------
  // DELETING
  // --------------------------------------------------

  deleteMemory(): void {
    const memory = this.memory();
    if (!memory) return;
    if (!confirm(`Close the door "${memory.title}" forever?`)) return;
    this.memoriesService.remove(memory.id).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.deleteError.set('The door is stuck. Try again.')
    });
  }
}