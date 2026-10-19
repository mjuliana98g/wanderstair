import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MemoriesService } from '../../services/memories';
import { Memory } from '../../models/memory.model';
import { RouterLink } from '@angular/router';

// --------------------------------------------------
// STAIR PAGE
// --------------------------------------------------

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-stair',
  styleUrl: './stair.css',
  templateUrl: './stair.html',
})
export class Stair implements OnInit {
  private memoriesService = inject(MemoriesService);

  memories = signal<Memory[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadMemories();
  }

   loadMemories(): void {
    this.memoriesService.getAll().subscribe({
      next: (memories) => {
        this.memories.set(this.sortByNewest(memories));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The stair could not be loaded. Is the API running?');
        this.loading.set(false);
      }
    });
  }

  private sortByNewest(memories: Memory[]): Memory[] {
    return [...memories].sort((a, b) => b.date.localeCompare(a.date));
  }
}
