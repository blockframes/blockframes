// Angular
import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';

// Blockframes
import { descTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';

import { Invitation } from '../../+state';

@Component({
  selector: 'invitation-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  @Input() invitations: Invitation[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

  timeFrames = descTimeFrames;

}
