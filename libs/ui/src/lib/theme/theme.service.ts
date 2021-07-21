import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  _theme = new BehaviorSubject<Theme>(undefined);
  theme$ = this._theme.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private media: MediaMatcher
  ) {
    this.document.body.classList.add('mat-app-background', 'mat-typography');
  }

  get theme() {
    return this._theme.getValue();
  }

  set theme(mode: Theme) {
    if (mode) {
      this.setTheme(mode);
      this.saveTheme(mode);
    }
  }

  private saveTheme(mode: Theme) {
    localStorage.setItem('theme', mode);
  }

  setTheme(mode: Theme) {
    this.document.body.classList.remove('dark-theme');
    this.document.body.classList.remove('light-theme');
    this.document.body.classList.add(`${mode}-theme`);
    this._theme.next(mode);
  }

  /** Get the current value of the theme */
  initTheme(mode: Theme) {
    const isDarkMedia = this.media.matchMedia('(prefers-color-scheme: dark)');
    let theme: Theme | undefined;
    // @dev check: https://web.dev/prefers-color-scheme/#finding-out-if-dark-mode-is-supported-by-the-browser
    if (isDarkMedia.media !== 'not all') {
      isDarkMedia.onchange = ({ matches }) => this.setTheme(matches ? 'dark' : 'light');
      theme = isDarkMedia.matches ? 'dark' : 'light';
    }
    if (localStorage) {
      const fromStorage = localStorage.getItem('theme') as Theme;
      if (fromStorage) theme = fromStorage;
    }
    this.setTheme(theme || mode);
  }
}
