import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subject, Subscription, debounce, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MuseumService } from '../../services/museum';
import { MemoriesService } from '../../services/memories';
import { Artwork } from '../../models/artwork.model';
import { Memory } from '../../models/memory.model';
import { Frame } from '../../components/frame/frame';

// --------------------------------------------------
// FIND ARTWORKS PAGE
// --------------------------------------------------

@Component({
  selector: 'app-find',
  imports: [FormsModule, RouterLink, Frame],
  templateUrl: './find.html',
  styleUrl: './find.css'
})

export class Find implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private museumService = inject(MuseumService);
  private memoriesService = inject(MemoriesService);

  term = '';
  results = signal<Artwork[]>([]);
  loading = signal(false);
  error = signal('');
  searched = signal(false);
  room = signal<Memory | null>(null);

  private typedTerms = new Subject<String>();
  private typing!: Subscription;

  ngOnInit(): void {
    const roomId = this.route.snapshot.queryParamMap.get('room');
    if (roomId) this.loadRoom(Number(roomId));
    this.typing = this.typedTerms
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(() => this.search());
  }

  onTyping(term: string): void {
    this.typedTerms.next(term.trim());
  }

  ngOnDestroy(): void {
    this.typing.unsubscribe();
  }

  loadRoom(id: number): void {
    this.memoriesService.getById(id).subscribe({
      next: (memory) => this.room.set(memory),
      error: () => this.error.set('This room does not exist.')
    });
  }

  search(): void {
    const term = this.term.trim();
    if (!term) return;
    this.loading.set(true);
    this.error.set('');
    this.searched.set(true);
    this.museumService.search(term).subscribe({
      next: (artworks) => {
        this.results.set(artworks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The archives are closed. Try again later.');
        this.loading.set(false);
      }
    });
  }

  // --------------------------------------------------
  // HANGING ARTWORKS
  // --------------------------------------------------

  isHung(artwork: Artwork): boolean {
    return this.room()?.artworks.includes(artwork.id) ?? false;
  }

  hang(artwork: Artwork): void {
    const room = this.room();
    if (!room || this.isHung(artwork)) return;
    this.memoriesService.updateArtworks(room.id, [...room.artworks, artwork.id]).subscribe({
      next: (saved) => this.room.set(saved),
      error: () => this.error.set('The painting could not be hung. Try again.')
    });
  }
}