import { Component, Input, TemplateRef, ContentChild, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ascTimeFrames, filterByDate, TimeFrame } from '@blockframes/utils/pipes/filter-by-date.pipe';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { EventBase } from '@blockframes/event/+state/event.firestore';

interface EventWithTimeFrame extends EventBase<Date> {
  timeFrame?: TimeFrame
}

@Component({
  selector: 'event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideUpList('li')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @HostBinding('@slideUpList') animation = true;
  timeFrames = ascTimeFrames;

  rows: EventWithTimeFrame[] = [];

  @Input() set events(_events: EventBase<Date>[]) {
    this.timeFrames.forEach(timeFrame => {
      const eventsFiltered = filterByDate(_events, timeFrame, 'start', 'end');
      let shouldDisplayTimeFrame = true; // TimeFrame is displayed only once for each events of the same timeFrame
      if (!!eventsFiltered && eventsFiltered.length) {
        eventsFiltered.forEach(event => {
          const eventWithTimeFrame = { ...event } as EventWithTimeFrame;
          if (shouldDisplayTimeFrame) {
            eventWithTimeFrame.timeFrame = timeFrame;
            shouldDisplayTimeFrame = false;
          }
          this.rows.push(eventWithTimeFrame);
        })
      }
    });
  }

  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

}
