import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

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

  signIn(): void {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set('');

    this.auth.signIn(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error.set('The email or password is not right.');
        this.sending.set(false);
      },
    });
  }
}
