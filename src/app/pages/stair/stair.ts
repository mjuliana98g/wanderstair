import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MemoriesService } from '../../services/memories';
import { Memory } from '../../models/memory.model';
import { RouterLink } from '@angular/router';
import { MuseumService } from '../../services/museum';
import { Artwork } from '../../models/artwork.model';
import { Frame } from '../../components/frame/frame';

// --------------------------------------------------
// STAIR PAGE
// --------------------------------------------------

@Component({
  imports: [DatePipe, RouterLink, Frame],
  selector: 'app-stair',
  styleUrl: './stair.css',
  templateUrl: './stair.html',
})
export class Stair implements OnInit {
  private memoriesService = inject(MemoriesService);
  private museumService = inject(MuseumService);

  memories = signal<Memory[]>([]);
  loading = signal(true);
  portrait = signal<Artwork | null>(null);
  portraitLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadPortrait();
    this.loadMemories();
  }

  loadMemories(): void {
    this.memoriesService.getAll().subscribe({
      next: (memories) => {
        this.memories.set(this.sortByNewest(memories));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The stair could not be loaded. Is the API running?');
        this.loading.set(false);
      }
    });
  }

  private sortByNewest(memories: Memory[]): Memory[] {
    return [...memories].sort((a, b) => b.date.localeCompare(a.date));
  }

  // --------------------------------------------------
  // PORTRAIT OF THE DAY
  // --------------------------------------------------

  loadPortrait(): void {
    this.museumService.getPortraitOfTheDay().subscribe({
      next: (artwork) => {
        this.portrait.set(artwork ?? null);
        this.portraitLoading.set(false);
      },
      error: () => this.portraitLoading.set(false)
    });
  }
}
