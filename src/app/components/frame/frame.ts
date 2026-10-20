import { Component, Input } from '@angular/core';

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

  artistName(): string {
    return this.artwork.creators[0]?.description ?? 'Unknown artist';
  }
}