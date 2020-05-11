import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';
import { Invitation } from '../../+state';

import { descTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';

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
