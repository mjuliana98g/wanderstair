import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { formatDate } from '@angular/common';

import { MemoriesService } from '../../services/memories';
import { DoorOption, DoorStyle, Mood, MoodOption, NewMemory } from '../../models/memory.model';
import { DOOR_STYLES, MOOD_FAMILIES, MoodFamily, familyOf } from '../../models/moods';

// --------------------------------------------------
// DATES
// --------------------------------------------------

function todayText(): string {
  return formatDate(new Date(), 'yyyy-MM-dd', 'en');
}

function notInFuture(control: AbstractControl): ValidationErrors | null {
  return control.value > todayText() ? { future: true } : null;
}

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
  moodOptions = signal<MoodOption[]>([]);
  doorOptions = signal<DoorOption[]>([]);
  saving = signal(false);
  error = signal('');
  familyOf = familyOf;
  today = todayText();

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    date: new FormControl(todayText(), { nonNullable: true, validators: [Validators.required, notInFuture] }),
    moods: new FormControl<Mood[]>([], { nonNullable: true, validators: [Validators.required] }),
    door: new FormControl<DoorStyle>('arch', { nonNullable: true }),
    text: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] })
  });

  ngOnInit(): void {
    this.memoriesService.getMoods().subscribe({
      next: (moods) => this.moodOptions.set(moods),
      error: () => this.error.set('The feelings could not be loaded. Try again later.')
    });
    this.memoriesService.getDoors().subscribe({
      next: (doors) => this.doorOptions.set(doors),
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
    const { title, date, moods, door, text } = this.form.getRawValue();
    const moodIds = moods.map((name) => this.moodOptions().find((option) => option.name === name)?.id);
    const doorId = this.doorOptions().find((option) => option.name === door)?.id;
    if (moodIds.includes(undefined) || !doorId) return null;
    return { title: title.trim(), date, text, moodIds: moodIds as number[], doorId };
  }

  // --------------------------------------------------
  // MOODS
  // --------------------------------------------------

  isChosen(mood: Mood): boolean {
    return this.form.controls.moods.value.includes(mood);
  }

  countIn(family: MoodFamily): number {
    return family.moods.filter((mood) => this.isChosen(mood)).length;
  }

  private setMoods(moods: Mood[]): void {
    this.form.controls.moods.setValue(moods);
    this.form.controls.moods.markAsTouched();
  }

  toggleMood(mood: Mood): void {
    const moods = this.form.controls.moods.value;
    const updated = this.isChosen(mood) ? moods.filter((item) => item !== mood) : [...moods, mood];
    this.setMoods(updated);
  }

  moveMood(index: number, step: number): void {
    const moods = [...this.form.controls.moods.value];
    const [mood] = moods.splice(index, 1);
    moods.splice(index + step, 0, mood);
    this.setMoods(moods);
  }

  removeMood(index: number): void {
    this.setMoods(this.form.controls.moods.value.filter((_, i) => i !== index));
  }

  doorFamily(): string {
    const first = this.form.controls.moods.value[0];
    return first ? familyOf(first) : 'mixed';
  }
}