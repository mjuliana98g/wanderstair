import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DoorStyle, Mood } from '../../models/memory.model';
import { DOOR_STYLES, MOOD_FAMILIES } from '../../models/moods';

// --------------------------------------------------
// WRITE A NEW MEMORY PAGE
// --------------------------------------------------

@Component({
  selector: 'app-write',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './write.html',
  styleUrl: './write.css'
})
export class Write {
  moodFamilies = MOOD_FAMILIES;
  doorStyles = DOOR_STYLES;

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mood: new FormControl<Mood | ''>('', { nonNullable: true, validators: [Validators.required] }),
    door: new FormControl<DoorStyle>('arch', { nonNullable: true }),
    text: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] })
  });

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }
}