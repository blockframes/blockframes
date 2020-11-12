import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';
import { Notification } from '../../+state';
import { descTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';

@Component({
  selector: 'notification-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  @Input() notifications: Notification[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

  timeFrames = descTimeFrames;
}
