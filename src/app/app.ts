import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'Wanderstair';
  isNight = signal(matchMedia('(prefers-color-scheme: dark)').matches);

  toggleTheme(): void {
    this.isNight.update((night) => !night);
    document.documentElement.dataset['theme'] = this.isNight() ? 'dark' : 'light';
  }
}