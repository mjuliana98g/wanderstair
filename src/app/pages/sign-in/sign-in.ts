import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthError } from '@supabase/supabase-js';
import { AuthService } from '../../services/auth';

// --------------------------------------------------
// SIGN IN PAGE
// --------------------------------------------------

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-sign-in',
  styleUrl: './sign-in.css',
  templateUrl: './sign-in.html',
})

export class SignIn {

  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  sending = signal(false);
  error = signal('');

  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((shown) => !shown);
  }

  signIn(): void {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set('');

    this.auth.signIn(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error: AuthError) => {
        this.error.set(this.messageFor(error));
        this.sending.set(false);
      },
    });
  }

  private messageFor(error: AuthError): string {
    if (error.code === 'email_not_confirmed') return 'Confirm your email first. Open the link we sent to your inbox.';
    return 'The email or password is not right.';
  }
}