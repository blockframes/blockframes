// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'bf-tag',
  template: '<ng-content></ng-content>',
  styles: [`
    :host {
      border: solid 1px var(--foreground-text);
      border-radius: 2px;
      padding: 0 8px;
      text-transform: uppercase;
    }
  `],
  // eslint-disable-next-line
  host: {
    'class': 'mat-caption'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent { }
