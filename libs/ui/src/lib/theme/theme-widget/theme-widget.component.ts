import { Component, OnInit, Renderer2, Inject, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'theme-widget',
  templateUrl: './theme-widget.component.html',
  styleUrls: ['./theme-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeWidgetComponent {

  theme$ = this.service.theme$;

  constructor(private service: ThemeService) { }

  setTheme(mode: 'dark' | 'light') {
    this.service.theme = mode;
  }
}
