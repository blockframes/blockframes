// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'bf-tag',
  template: '<ng-content></ng-content>',
  styles: [`
    :host {
      border: solid 1px var(--foreground-text);
      border-radius: 2px;
      padding: 4px 8px;
      text-transform: uppercase;
      font-size: 14px;
      white-space: nowrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent { }
