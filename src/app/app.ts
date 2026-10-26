import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const THEME_KEY = 'wanderstair-theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = 'Wanderstair';
  isNight = signal(false);

  ngOnInit(): void {
    const saved = localStorage.getItem(THEME_KEY);
    const night = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(night);
  }

  toggleTheme(): void {
    const night = !this.isNight();
    this.applyTheme(night);
    localStorage.setItem(THEME_KEY, night ? 'dark' : 'light');
  }

  private applyTheme(night: boolean): void {
    this.isNight.set(night) ;
    document.documentElement.dataset['theme'] = night ? 'dark' : 'light';
  }
}