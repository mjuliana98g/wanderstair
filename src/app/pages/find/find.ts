import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subject, Subscription, debounce, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterOutlet, Router } from '@angular/router';

import { MuseumService } from '../../services/museum';
import { MemoriesService } from '../../services/memories';
import { Artwork } from '../../models/artwork.model';
import { Memory } from '../../models/memory.model';
import { Frame } from '../../components/frame/frame';
import { GiftsService } from '../../services/gifts';

// --------------------------------------------------
// FIND ARTWORKS PAGE
// --------------------------------------------------

@Component({
  selector: 'app-find',
  imports: [FormsModule, RouterLink, Frame, RouterOutlet],
  templateUrl: './find.html',
  styleUrl: './find.css'
})

export class Find implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private museumService = inject(MuseumService);
  private memoriesService = inject(MemoriesService);
  private giftsService = inject(GiftsService);

  term = '';
  results = signal<Artwork[]>([]);
  loading = signal(false);
  error = signal('');
  searched = signal(false);
  room = signal<Memory | null>(null);
  detailOpen = signal(false);
  giftedHere = signal<number[]>([]);

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

  // --------------------------------------------------
  // DETAIL MODAL
  // --------------------------------------------------

  closeDetail(): void {
    this.router.navigate(['/find'], { queryParamsHandling: 'preserve' });
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeDetail();
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.detailOpen()) this.closeDetail();
  }

  loadRoom(id: number): void {
    this.memoriesService.getById(id).subscribe({
      next: (memory) => this.room.set(memory),
      error: () => this.error.set('This room does not exist.')
    });
    this.giftsService.forMemory(id).subscribe((gifts) => this.giftedHere.set(gifts.map((gift) => gift.artworkId)));
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
    const chosen = this.room()?.artworks.includes(artwork.id) ?? false;
    return chosen || this.giftedHere().includes(artwork.id);
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