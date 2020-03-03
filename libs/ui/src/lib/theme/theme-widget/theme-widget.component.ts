import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'theme-widget',
  templateUrl: './theme-widget.component.html',
  styleUrls: ['./theme-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeWidgetComponent {
  
  theme$ = this.service.theme$;
  @Input() set theme(mode: 'dark' | 'light') {
    this.setTheme(mode);
  }

  constructor(private service: ThemeService) { }

  setTheme(mode: 'dark' | 'light') {
    this.service.theme = mode;
  }
}
