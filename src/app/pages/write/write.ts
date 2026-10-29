import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';

import { MemoriesService } from '../../services/memories';
import { DoorOption, DoorStyle, Memory, Mood, MoodOption, NewMemory } from '../../models/memory.model';
import { DOOR_STYLES, MOOD_FAMILIES, MoodFamily, familyOf } from '../../models/moods';

const MAX_TITLE = 40;
const MAX_MOODS = 3;

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
// DEVICE
// --------------------------------------------------

function canHover(): boolean {
  return matchMedia('(hover: hover)').matches;
}

// --------------------------------------------------
// WRITE OR EDIT A MEMORY PAGE
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
  private route = inject(ActivatedRoute);

  moodFamilies = MOOD_FAMILIES;
  doorStyles = DOOR_STYLES;
  moodOptions = signal<MoodOption[]>([]);
  doorOptions = signal<DoorOption[]>([]);
  editingId = Number(this.route.snapshot.paramMap.get('id')) || null;
  loading = signal(this.editingId !== null);
  saving = signal(false);
  error = signal('');
  familyOf = familyOf;
  today = todayText();
  maxTitle = MAX_TITLE;
  maxMoods = MAX_MOODS;

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(MAX_TITLE)] }),
    date: new FormControl(todayText(), { nonNullable: true, validators: [Validators.required, notInFuture] }),
    moods: new FormControl<Mood[]>([], { nonNullable: true, validators: [Validators.required, Validators.maxLength(MAX_MOODS)] }),
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
    if (this.editingId) this.loadMemory(this.editingId);
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  submitLabel(): string {
    if (this.editingId) return this.saving() ? 'Saving…' : 'Save changes';
    return this.saving() ? 'Opening…' : 'Open the door';
  }

  cancelLink(): (string | number)[] {
    return this.editingId ? ['/room', this.editingId] : ['/'];
  }

  // --------------------------------------------------
  // EDITING
  // --------------------------------------------------

  private loadMemory(id: number): void {
    this.memoriesService.getById(id).subscribe({
      next: (memory) => {
        this.fillForm(memory);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This memory could not be found.');
        this.loading.set(false);
      }
    });
  }

  private fillForm(memory: Memory): void {
    const { title, date, moods, door, text } = memory;
    this.form.setValue({ title, date, moods, door, text });
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
    this.send(memory).subscribe({
      next: (saved) => this.router.navigate(['/room', saved.id]),
      error: () => {
        this.error.set(this.editingId ? 'The changes could not be saved. Try again.' : 'The door would not open. Try again.');
        this.saving.set(false);
      }
    });
  }

  private send(memory: NewMemory): Observable<Memory> {
    return this.editingId ? this.memoriesService.update(this.editingId, memory) : this.memoriesService.create(memory);
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

  isFull(): boolean {
    return this.form.controls.moods.value.length >= MAX_MOODS;
  }

  countIn(family: MoodFamily): number {
    return family.moods.filter((mood) => this.isChosen(mood)).length;
  }

  private setMoods(moods: Mood[]): void {
    this.form.controls.moods.setValue(moods);
    this.form.controls.moods.markAsTouched();
  }

  toggleMood(mood: Mood): void {
    if (this.isFull() && !this.isChosen(mood)) return;
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

  openOnHover(box: HTMLDetailsElement): void {
    if (canHover()) box.open = true;
  }

  closeOnLeave(box: HTMLDetailsElement): void {
    if (canHover()) box.open = false;
  }

  doorFamily(): string {
    const first = this.form.controls.moods.value[0];
    return first ? familyOf(first) : 'mixed';
  }
}