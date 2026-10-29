import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { passwordsMatch } from '../../validators/passwords-match';

// --------------------------------------------------
// RESET PASSWORD PAGE
// --------------------------------------------------

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-reset-password',
  styleUrl: './reset-password.css',
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: passwordsMatch });

  checking = signal(true);
  linkWorks = signal(false);
  saving = signal(false);
  error = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    this.auth.hasSession().then((signedIn) => {
      this.linkWorks.set(signedIn);
      this.checking.set(false);
    });
  }

  togglePassword(): void {
    this.showPassword.update((shown) => !shown);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((shown) => !shown);
  }

  // --------------------------------------------------
  // SAVING
  // --------------------------------------------------

  savePassword(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.auth.setNewPassword(this.form.controls.password.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error: { code?: string }) => {
        this.error.set(this.messageFor(error));
        this.saving.set(false);
      },
    });
  }

  private messageFor(error: { code?: string }): string {
    if (error.code === 'same_password') return 'The new password must be different from the old one.';
    return 'Your password could not be saved. Ask for a new link and try again.';
  }
}