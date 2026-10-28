import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Artwork } from '../../models/artwork.model';
import { RouterLink } from '@angular/router';

// --------------------------------------------------
// FRAME COMPONENT
// --------------------------------------------------

@Component({
  selector: 'app-frame',
  templateUrl: './frame.html',
  styleUrl: './frame.css',
  imports: [RouterLink]
})

export class Frame {

  @Input({ required: true }) artwork!: Artwork;
  @Input() actionLabel = '';
  @Input() detailLink: (string | number)[] | null = null;
  @Input() still = false;
  @Input() sendLink: (string | number)[] | null = null;
  @Output() action = new EventEmitter<Artwork>();

  artistName(): string {
    return (this.artwork.creators[0]?.description ?? 'Unknown artist').split(' (')[0];
  }

  emitAction(): void {
    this.action.emit(this.artwork);
  }

  linkToDetail(): (string | number)[] | null {
    if (this.still) return null;
    return this.detailLink ?? ['/artwork', this.artwork.id];
  }
}