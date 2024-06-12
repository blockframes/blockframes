import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input, Inject } from '@angular/core';
import { App, Notification, getTimeFrames, preferredLanguage } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'notification-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  @Input() notifications: Notification[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<unknown>;

  /** @dev i18n is only on waterfall app for now #9699 */
  timeFrames = getTimeFrames('desc', this.app === 'waterfall' ? preferredLanguage() : undefined);
  constructor(@Inject(APP) private app: App) { }
}
