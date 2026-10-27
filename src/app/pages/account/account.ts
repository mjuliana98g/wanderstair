import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { MemoriesService } from '../../services/memories';
import { Memory } from '../../models/memory.model';
import { MOOD_FAMILIES, familyOf } from '../../models/moods';

@Component({
  imports: [DatePipe, TitleCasePipe],
  selector: 'app-account',
  styleUrl: './account.css',
  templateUrl: './account.html',
})

export class Account implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);
  private memoriesService = inject(MemoriesService);
  user = this.auth.user;
  memories = signal<Memory[]>([]);
  loading = signal(true);
  error = signal('');
  families = MOOD_FAMILIES.map((family) => family.name.toLowerCase());

  ngOnInit(): void {
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

  share(family: string): number {
    const total = this.memories().length;
    return total ? (this.familyCount(family) / total) * 100 : 0;
  }

  topFamily(): string | null {
    const counts = this.families.map((family) => ({ family, count: this.familyCount(family) }));
    const top = counts.sort((a, b) => b.count - a.count)[0];
    return top && top.count > 0 ? top.family : null;
  }
}
