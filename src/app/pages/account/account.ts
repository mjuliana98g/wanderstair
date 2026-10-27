import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  imports: [DatePipe],
  selector: 'app-account',
  styleUrl: './account.css',
  templateUrl: './account.html',
})

export class Account {

  private auth = inject(AuthService);
  user = this.auth.user;
  private router = inject(Router);

  name(): string {
    return this.user()?.user_metadata['name'] ?? '';
  }

  signOut(): void {
    this.auth.signOut().subscribe(() => this.router.navigate(['/sign-in']));
  }
}
