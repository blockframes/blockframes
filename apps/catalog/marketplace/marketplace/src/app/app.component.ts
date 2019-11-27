import { ChangeDetectionStrategy, Component, Renderer2 } from '@angular/core';
import { ThemeService } from '@blockframes/ui/theme';
import { IconComponent } from '@blockframes/ui';
import { NgxMetrikaService } from '@kolkov/ngx-metrika';

@Component({
  selector: 'catalog-marketplace-root',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    renderer: Renderer2,
    theme: ThemeService,
    icons: IconComponent,  // even if not used in component, keep this to load icons
    ym: NgxMetrikaService // needs to be initialized in the root component
  ) {
    theme.initTheme(renderer, 'dark');
  }
}
