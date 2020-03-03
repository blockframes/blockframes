import { Injectable, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2
  _theme = new BehaviorSubject<string>('');
  theme$ = this._theme.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.document.body.classList.add('mat-app-background', 'mat-typography');
  }

  get theme() {
    return this._theme.getValue();
  }

  set theme(mode: string) {
    if (mode) {
      this.setTheme(mode);
      this.saveTheme(mode);
    }
  }

  private saveTheme(mode: string) {
    localStorage.setItem('theme', mode);
  }

  private setTheme(mode: string) {
    this.document.body.classList.remove('dark-theme');
    this.document.body.classList.remove('light-theme');
    this.document.body.classList.add(`${mode}-theme`);
    this._theme.next(mode);
  }

  /** Get the current value of the theme */
  initTheme(renderer: Renderer2, mode: 'dark' | 'light') {
    if (!this.renderer) {
      this.renderer = renderer;
      const theme = localStorage.getItem('theme') || mode;
      this.setTheme(theme);
    }
  }
}
