import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MuseumService } from '../../services/museum';
import { Artwork } from '../../models/artwork.model';
import { Frame } from '../../components/frame/frame';

// --------------------------------------------------
// FIND ARTWORKS PAGE
// --------------------------------------------------

@Component({
  selector: 'app-find',
  imports: [FormsModule, Frame],
  templateUrl: './find.html',
  styleUrl: './find.css'
})
export class Find {
  private museumService = inject(MuseumService);

  term = '';
  results = signal<Artwork[]>([]);
  loading = signal(false);
  error = signal('');
  searched = signal(false);

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
}