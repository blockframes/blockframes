import { Component, Input, TemplateRef, ContentChild, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ascTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { EventBase } from '@blockframes/shared/model';

@Component({
  selector: 'event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideUpList('li')],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @HostBinding('@slideUpList') animation = true;
  timeFrames = ascTimeFrames;

  @Input() events: EventBase<Date>[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<unknown>;
}
