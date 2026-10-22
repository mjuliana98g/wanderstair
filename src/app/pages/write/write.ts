import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MemoriesService } from '../../services/memories';
import { DoorOption, DoorStyle, Mood, MoodOption, NewMemory } from '../../models/memory.model';
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
export class Write implements OnInit {
  private memoriesService = inject(MemoriesService);
  private router = inject(Router);

  moodFamilies = MOOD_FAMILIES;
  doorStyles = DOOR_STYLES;
  moods = signal<MoodOption[]>([]);
  doors = signal<DoorOption[]>([]);
  saving = signal(false);
  error = signal('');

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mood: new FormControl<Mood | ''>('', { nonNullable: true, validators: [Validators.required] }),
    door: new FormControl<DoorStyle>('arch', { nonNullable: true }),
    text: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] })
  });

  ngOnInit(): void {
    this.memoriesService.getMoods().subscribe({
      next: (moods) => this.moods.set(moods),
      error: () => this.error.set('The feelings could not be loaded. Try again later.')
    });
    this.memoriesService.getDoors().subscribe({
      next: (doors) => this.doors.set(doors),
      error: () => this.error.set('The doors could not be loaded. Try again later.')
    });
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  // --------------------------------------------------
  // SAVING
  // --------------------------------------------------

  save(): void {
    if (this.form.invalid) return;
    const memory = this.toMemory();
    if (!memory) {
      this.error.set('The feelings and doors are still loading. Try again in a moment.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.memoriesService.create(memory).subscribe({
      next: (saved) => this.router.navigate(['/room', saved.id]),
      error: () => {
        this.error.set('The door would not open. Try again.');
        this.saving.set(false);
      }
    });
  }

  private toMemory(): NewMemory | null {
    const { title, date, mood, door, text } = this.form.getRawValue();
    const moodId = this.moods().find((option) => option.name === mood)?.id;
    const doorId = this.doors().find((option) => option.name === door)?.id;
    if (!moodId || !doorId) return null;
    return { title: title.trim(), date, text, moodIds: [moodId], doorId };
  }
}