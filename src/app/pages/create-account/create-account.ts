import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthError } from '@supabase/supabase-js';
import { AuthService } from '../../services/auth';
import { passwordsMatch } from '../../validators/passwords-match';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-create-account',
  styleUrl: './create-account.css',
  templateUrl: './create-account.html',
})

export class CreateAccount {

  private auth = inject(AuthService);
  private router = inject(Router);

  sending = signal(false);
  error = signal('');
  waitingForEmail = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((shown) => !shown);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((shown) => !shown);
  }

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(30)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: passwordsMatch });

  createAccount(): void {
    if (this.form.invalid) return;

    const { name, email, password } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set('');

    this.auth.signUp(name.trim(), email, password).subscribe({
      next: (signedIn) => this.openStairOrWait(signedIn),
      error: (error: AuthError) => {
        this.error.set(this.messageFor(error));
        this.sending.set(false);
      },
    });
  }

  private openStairOrWait(signedIn: boolean): void {
    if (signedIn) {
      this.router.navigate(['/']);
      return;
    }
    this.waitingForEmail.set(true);
  }

  private messageFor(error: AuthError): string {
    if (error.code === 'user_already_exists') return 'There is already an account with this email.';
    return 'The account could not be created. Try again in a few minutes.';
  }
}