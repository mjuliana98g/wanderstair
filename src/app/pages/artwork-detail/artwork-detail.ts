import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MuseumService } from '../../services/museum';
import { Artwork } from '../../models/artwork.model';

// --------------------------------------------------
// ARTWORK DETAIL PAGE
// --------------------------------------------------

@Component({
  selector: 'app-artwork-detail',
  imports: [RouterLink],
  templateUrl: './artwork-detail.html',
  styleUrl: './artwork-detail.css'
})
export class ArtworkDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private museumService = inject(MuseumService);

  artwork = signal<Artwork | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArtwork(id);
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

  artistName(artwork: Artwork): string {
    return artwork.creators[0]?.description ?? 'Unknown artist';
  }
}