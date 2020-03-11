import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IconService } from '../../icon-service';
import { ThemeService } from '@blockframes/ui/theme';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

type Views = 'component' | 'icons';

@Component({
  selector: 'storybook-toolkit',
  templateUrl: './toolkit.component.html',
  styleUrls: ['./toolkit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolkitComponent {

  view: Views = 'component';
  theme$ = this.themeService.theme$;

  constructor(icons: IconService, private themeService: ThemeService, private cdr: ChangeDetectorRef) {
    this.themeService.theme = 'light';
  }

  setTheme({ checked }: MatSlideToggleChange) {
    const mode = checked ? 'dark' : 'light';
    this.themeService.theme = mode;
    this.cdr.markForCheck();
  }

}
