// Angular
import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input, Inject } from '@angular/core';

// Blockframes
import { App, Invitation, getTimeFrames, preferredLanguage } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'invitation-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  @Input() invitations: Invitation[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<unknown>;

  /** @dev i18n is only on waterfall app for now #9699 */
  timeFrames = getTimeFrames('desc', this.app === 'waterfall' ? preferredLanguage() : undefined);
  constructor(@Inject(APP) private app: App) { }

  trackById = (i: number, doc: { id: string }) => doc.id;

}
