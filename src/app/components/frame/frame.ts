import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Artwork, shortArtistName } from '../../models/artwork.model';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.html',
  styleUrl: './frame.css',
  imports: [RouterLink],
})
export class Frame {
  @Input({ required: true }) artwork!: Artwork;
  @Input() actionLabel = '';
  @Input() detailLink: (string | number)[] | null = null;
  @Input() still = false;
  @Input() sendLink: (string | number)[] | null = null;
  @Input() gift: string | null = null;
  @Output() action = new EventEmitter<Artwork>();

  shortArtistName = shortArtistName;

  emitAction(): void {
    this.action.emit(this.artwork);
  }

  linkToDetail(): (string | number)[] | null {
    if (this.still) return null;
    return this.detailLink ?? ['/artwork', this.artwork.id];
  }
}