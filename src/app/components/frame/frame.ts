import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Artwork } from '../../models/artwork.model';

// --------------------------------------------------
// FRAME COMPONENT
// --------------------------------------------------

@Component({
  selector: 'app-frame',
  templateUrl: './frame.html',
  styleUrl: './frame.css'
})
export class Frame {
  @Input({ required: true }) artwork!: Artwork;
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<Artwork>();

  artistName(): string {
    return this.artwork.creators[0]?.description ?? 'Unknown artist';
  }

  emitAction(): void {
    this.action.emit(this.artwork);
  }
}