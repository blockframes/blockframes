import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef } from '@angular/core';;
import { EventService } from '@blockframes/event/+state/event.service';
import { EventAnalytics } from '@blockframes/event/+state/event.firestore';

const columns = {
  name: 'Name',
  email: 'Email Address'
};

@Component({
  selector: 'festival-event-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventAnalyticsComponent implements OnInit {

  analytics : EventAnalytics[];

  @Input() eventId: string;

  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private service: EventService,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const transformEvent = (event: EventAnalytics) => ({ ...event, name: `${event.firstName} ${event.lastName}` });
    const analytics = await this.service.queryAnalytics(this.eventId);
    this.analytics = analytics.eventUsers.map(transformEvent);
    this.cdr.markForCheck();
  }
}
