import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { PostcardsService } from './services/postcards';

const THEME_KEY = 'wanderstair-theme';
const TOP_BUTTON_AFTER = 400;

// APP

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = 'Wanderstair';
  protected readonly year = new Date().getFullYear();
  private auth = inject(AuthService);
  user = this.auth.user;
  postcards = inject(PostcardsService);

  isNight = signal(false);
  menuOpen = signal(false);
  showTopButton = signal(false);

  ngOnInit(): void {
    const saved = localStorage.getItem(THEME_KEY);
    const night = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(night);
    this.postcards.refreshUnread();
  }

  firstName(): string {
    return this.auth.userName().trim().split(' ')[0];
  }

  // THEME

  toggleTheme(): void {
    const night = !this.isNight();
    this.applyTheme(night);
    localStorage.setItem(THEME_KEY, night ? 'dark' : 'light');
  }

  private applyTheme(night: boolean): void {
    this.isNight.set(night);
    document.documentElement.dataset['theme'] = night ? 'dark' : 'light';
  }

  // MENU

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeMenuOnEscape(): void {
    this.closeMenu();
  }

  // BACK TO THE TOP

  @HostListener('window:scroll')
  checkTopButton(): void {
    this.showTopButton.set(window.scrollY > TOP_BUTTON_AFTER);
  }

  scrollToTop(): void {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  }
}