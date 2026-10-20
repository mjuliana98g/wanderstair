import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MemoriesService } from '../../services/memories';
import { DoorStyle, Mood, NewMemory } from '../../models/memory.model';
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
  private memoriesService = inject(MemoriesService);
  private router = inject(Router);

  moodFamilies = MOOD_FAMILIES;
  doorStyles = DOOR_STYLES;
  saving = signal(false);
  error = signal('');

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

  // --------------------------------------------------
  // SAVING
  // --------------------------------------------------

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.memoriesService.create(this.toMemory()).subscribe({
      next: (saved) => this.router.navigate(['/room', saved.id]),
      error: () => {
        this.error.set('The door would not open. Is the API running?');
        this.saving.set(false);
      }
    });
  }

  private toMemory(): NewMemory {
    const { title, date, mood, door, text } = this.form.getRawValue();
    return { title: title.trim(), date, mood: mood as Mood, door, text, artworks: [] };
  }
}