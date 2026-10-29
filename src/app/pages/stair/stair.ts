import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe, ViewportScroller } from '@angular/common';
import { Router, RouterLink, Scroll } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { MemoriesService } from '../../services/memories';
import { MuseumService } from '../../services/museum';
import { PostcardsService } from '../../services/postcards';
import { Memory } from '../../models/memory.model';
import { Artwork } from '../../models/artwork.model';
import { Frame } from '../../components/frame/frame';
import { familyOf } from '../../models/moods';

const HEADER_SPACE = 90;

@Component({
  imports: [DatePipe, RouterLink, Frame],
  selector: 'app-stair',
  styleUrl: './stair.css',
  templateUrl: './stair.html',
})
export class Stair implements OnInit, OnDestroy {
  private memoriesService = inject(MemoriesService);
  private museumService = inject(MuseumService);
  private postcardsService = inject(PostcardsService);
  private router = inject(Router);
  private scroller = inject(ViewportScroller);

  memories = signal<Memory[]>([]);
  loading = signal(true);
  portrait = signal<Artwork | null>(null);
  portraitLoading = signal(true);
  error = signal('');
  familyOf = familyOf;

  private pendingScroll: Scroll | null = null;
  private scrolling: Subscription = this.router.events
    .pipe(filter((event) => event instanceof Scroll))
    .subscribe((event) => this.pendingScroll = event);

  ngOnInit(): void {
    this.loadPortrait();
    this.loadMemories();
    this.postcardsService.refreshUnread();
  }

  ngOnDestroy(): void {
    this.scrolling.unsubscribe();
  }

  loadMemories(): void {
    this.memoriesService.getAll().subscribe({
      next: (memories) => {
        this.memories.set(this.sortByNewest(memories));
        this.loading.set(false);
        this.restoreScroll();
      },
      error: () => {
        this.error.set('The stair could not be loaded. Try again later.');
        this.loading.set(false);
        this.restoreScroll();
      }
    });
  }

  private sortByNewest(memories: Memory[]): Memory[] {
    return [...memories].sort((a, b) => b.date.localeCompare(a.date));
  }

  // PORTRAIT OF THE DAY

  loadPortrait(): void {
    this.museumService.getPortraitOfTheDay().subscribe({
      next: (artwork) => {
        this.portrait.set(artwork ?? null);
        this.portraitLoading.set(false);
        this.restoreScroll();
      },
      error: () => {
        this.portraitLoading.set(false);
        this.restoreScroll();
      }
    });
  }

  // SCROLL

  private restoreScroll(): void {
    const scroll = this.pendingScroll;
    if (!scroll || this.loading() || this.portraitLoading()) return;
    this.pendingScroll = null;
    setTimeout(() => this.scrollTo(scroll));
  }

  private scrollTo(scroll: Scroll): void {
    if (scroll.position) {
      this.scroller.scrollToPosition(scroll.position);
    } else if (scroll.anchor) {
      this.scroller.setOffset([0, HEADER_SPACE]);
      this.scroller.scrollToAnchor(scroll.anchor);
    }
  }
}