import { Component, Input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Artwork } from '../../models/artwork.model';
import { Mood } from '../../models/memory.model';
import { familyOf } from '../../models/moods';

@Component({
  imports: [DatePipe],
  selector: 'app-postcard',
  styleUrl: './postcard.css',
  templateUrl: './postcard.html',
})
export class Postcard {
  @Input() artwork!: Artwork;
  @Input() title = '';
  @Input() date = '';
  @Input() moods: Mood[] = [];
  @Input() message = '';
  @Input() from = '';
  @Input() to = '';

  familyOf = familyOf;
  flipped = signal(false);

  flip(): void {
      this.flipped.update((value) => !value)
  }
}
