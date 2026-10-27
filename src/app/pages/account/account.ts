import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';
import { MemoriesService } from '../../services/memories';
import { Memory } from '../../models/memory.model';
import { MOOD_FAMILIES, familyOf } from '../../models/moods';
import { passwordsMatch } from '../../validators/passwords-match';

// --------------------------------------------------
// ACCOUNT PAGE
// --------------------------------------------------

@Component({
  selector: 'app-account',
  imports: [DatePipe, TitleCasePipe, ReactiveFormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private memoriesService = inject(MemoriesService);

  user = this.auth.user;
  families = MOOD_FAMILIES.map((family) => family.name.toLowerCase());

  memories = signal<Memory[]>([]);
  loading = signal(true);
  error = signal('');

  nameForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(30)] }),
  });
  savingName = signal(false);
  nameMessage = signal('');
  nameError = signal('');

  passwordForm = new FormGroup({
    current: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: passwordsMatch });
  savingPassword = signal(false);
  passwordMessage = signal('');
  passwordError = signal('');
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  confirmingDelete = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  deletePassword = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  ngOnInit(): void {
    this.nameForm.controls.name.setValue(this.name());
    this.memoriesService.getAll().subscribe({
      next: (memories) => {
        this.memories.set(memories);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Your stair could not be counted. Try again later.');
        this.loading.set(false);
      },
    });
  }

  name(): string {
    return this.user()?.user_metadata['name'] ?? '';
  }

  signOut(): void {
    this.auth.signOut().subscribe(() => this.router.navigate(['/sign-in']));
  }

  // --------------------------------------------------
  // YOUR STAIR
  // --------------------------------------------------

  paintingCount(): number {
    return this.memories().reduce((total, memory) => total + memory.artworks.length, 0);
  }

  lastDate(): string | null {
    const dates = this.memories().map((memory) => memory.date).sort();
    return dates.at(-1) ?? null;
  }

  familyCount(family: string): number {
    return this.memories().filter((memory) => familyOf(memory.moods[0]) === family).length;
  }

  sortedFamilies(): string[] {
    return [...this.families].sort((a, b) => this.familyCount(b) - this.familyCount(a))
  }

  share(family: string): number {
    const total = this.memories().length;
    return total ? (this.familyCount(family) / total) * 100 : 0;
  }

  topFamilies(): string[] {
    const best = Math.max(...this.families.map((family) => this.familyCount(family)));
    return best > 0 ? this.families.filter((family) => this.familyCount(family) === best) : [];
  }

  topLabel(): string {
    const names = this.topFamilies().map((family) => family[0].toUpperCase() + family.slice(1));
    return new Intl.ListFormat('en', { type: 'conjunction' }).format(names);
  }

  // --------------------------------------------------
  // YOUR NAME
  // --------------------------------------------------

  saveName(): void {
    if (this.nameForm.invalid) return;
    this.savingName.set(true);
    this.nameMessage.set('');
    this.nameError.set('');
    this.auth.updateName(this.nameForm.controls.name.value.trim()).subscribe({
      next: () => {
        this.nameMessage.set('Your name was saved.');
        this.savingName.set(false);
      },
      error: () => {
        this.nameError.set('Your name could not be saved. Try again.');
        this.savingName.set(false);
      },
    });
  }

  // --------------------------------------------------
  // YOUR PASSWORD
  // --------------------------------------------------

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    const { current, password } = this.passwordForm.getRawValue();
    this.savingPassword.set(true);
    this.passwordMessage.set('');
    this.passwordError.set('');
    this.auth.changePassword(current, password).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.passwordMessage.set('Your password was changed.');
        this.savingPassword.set(false);
      },
      error: (error: { message?: string; code?: string }) => {
        this.passwordError.set(this.passwordMessageFor(error));
        this.savingPassword.set(false);
      },
    });
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((shown) => !shown);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((shown) => !shown);
  }

  private passwordMessageFor(error: { message?: string; code?: string }): string {
    if (error.message === 'wrong-password') return 'Your current password is not right.';
    if (error.code === 'same_password') return 'The new password must be different from the current one.';
    return 'Your password could not be changed. Try again.';
  }

  // --------------------------------------------------
  // DELETE ACCOUNT
  // --------------------------------------------------

  canDelete(): boolean {
    return this.deletePassword.valid && !this.deleting();
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
    this.deletePassword.reset();
    this.deleteError.set('');
  }

  deleteAccount(): void {
    if (!this.canDelete()) return;
    this.deleting.set(true);
    this.deleteError.set('');
    this.auth.deleteAccount(this.deletePassword.value).subscribe({
      next: () => this.router.navigate(['/create-account']),
      error: (error: { message?: string }) => {
        this.deleteError.set(error.message === 'wrong-password' ? 'Your password is not right.' : 'Your account could not be deleted. Try again.');
        this.deletePassword.reset();
        this.deleting.set(false);
      },
    });
  }
}