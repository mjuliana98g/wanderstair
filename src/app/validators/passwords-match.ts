import { AbstractControl, ValidationErrors } from '@angular/forms';

// --------------------------------------------------
// PASSWORDS MATCH
// --------------------------------------------------

export function passwordsMatch(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsDiffer: true };
}