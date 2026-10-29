import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.css',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private auth = inject(AuthService);

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  sending = signal(false);
  sent = signal(false);
  error = signal('');

  sendLink(): void {
    if (this.form.invalid) return;
    this.sending.set(true);
    this.error.set('');
    this.auth.sendPasswordReset(this.form.controls.email.value.trim()).subscribe({
      next: () => this.sent.set(true),
      error: () => {
        this.error.set('The link could not be sent. Wait a few minutes and try again.');
        this.sending.set(false);
      },
    });
  }
}