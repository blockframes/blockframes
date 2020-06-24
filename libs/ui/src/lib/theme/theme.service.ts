import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  _theme = new BehaviorSubject<Theme>(undefined);
  theme$ = this._theme.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
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

  private setTheme(mode: Theme) {
    this.document.body.classList.remove('dark-theme');
    this.document.body.classList.remove('light-theme');
    this.document.body.classList.add(`${mode}-theme`);
    this._theme.next(mode);
  }

  /** Get the current value of the theme */
  initTheme(mode: Theme) {
    const theme = isPlatformBrowser(PLATFORM_ID) ? localStorage.getItem('theme') as Theme || mode : mode;
    this.setTheme(theme);
  }
}
