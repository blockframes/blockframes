// Angular
import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';

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
    :host.disabled {
      color: var(--foreground-disabled-text);
      border-color: var(--foreground-disabled-text);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent { 
  @HostBinding('class.disabled') @Input() @boolean disabled: boolean;
}
