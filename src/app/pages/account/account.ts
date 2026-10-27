import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  imports: [DatePipe],
  selector: 'app-account',
  styleUrl: './account.css',
  templateUrl: './account.html',
})

export class Account {

  private auth = inject(AuthService);
  user = this.auth.user;

  name(): string {
    return this.user()?.user_metadata['name'] ?? '';
  }
}
