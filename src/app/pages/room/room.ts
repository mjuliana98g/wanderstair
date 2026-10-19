import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { MemoriesService } from '../../services/memories';
import { Memory } from '../../models/memory.model';

// --------------------------------------------------
// ROOM PAGE
// --------------------------------------------------

@Component({
  selector: 'app-room',
  imports: [DatePipe, RouterLink],
  templateUrl: './room.html',
  styleUrl: './room.css'
})
export class Room implements OnInit {
  private route = inject(ActivatedRoute);
  private memoriesService = inject(MemoriesService);

  memory = signal<Memory | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadMemory(id);
  }

  loadMemory(id: string): void {
    this.memoriesService.getById(id).subscribe({
      next: (memory) => {
        this.memory.set(memory);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This door does not exist.');
        this.loading.set(false);
      }
    });
  }
}