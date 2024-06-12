import { Component, Input, TemplateRef, ContentChild, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { Event, getTimeFrames } from '@blockframes/model';

@Component({
  selector: 'event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideUpList('li')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @HostBinding('@slideUpList') animation = true;
  timeFrames = getTimeFrames('asc');

  @Input() events: Event[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<unknown>;

}
