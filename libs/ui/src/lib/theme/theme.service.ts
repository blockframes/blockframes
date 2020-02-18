import { Injectable, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2
  _theme = new BehaviorSubject<string>('');
  theme$ = this._theme.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  get theme() {
    return this._theme.getValue();
  }

  set theme(mode: string) {
    this.setTheme(mode);
    this.saveTheme(mode);
  }

  private saveTheme(mode: string) {
    localStorage.setItem('theme', mode);
  }

  private setTheme(mode: string) {
    this.renderer.removeClass(this.document.body, 'dark-theme');
    this.renderer.removeClass(this.document.body, 'light-theme');
    this.renderer.addClass(this.document.body, `${mode}-theme`);
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
