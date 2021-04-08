import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef } from '@angular/core';;
import { EventService } from '@blockframes/event/+state/event.service';
import { EventAnalytics } from '@blockframes/event/+state/event.firestore';
import { Event, EventQuery } from '@blockframes/event/+state';
import { InvitationQuery } from '@blockframes/invitation/+state';

const columns = {
  name: 'Name',
  email: 'Email Address',
  orgName: 'Company Name',
  orgActivity: 'Company Activity',
  orgCountry: 'Country',
};

@Component({
  selector: 'event-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventAnalyticsComponent implements OnInit {

  analytics: EventAnalytics[];

  @Input() event: Event<any>;

  public columns: Record<string, string> = columns;
  public initialColumns = Object.keys(columns);

  public averageWatchTime = 0; // in seconds

  constructor(
    private service: EventService,
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const transformEvent = (event: EventAnalytics) => {
      const transformedAnalytic = {
        ...event,
        name: `${event.firstName} ${event.lastName}`,
      };

      // add watch time to the analytic record
      if (this.event.type === 'screening') {
        const [invitation] = this.invitationQuery.getAll({
          filterBy: invit => invit.toUser.uid === event.userId && invit.eventId === event.eventId
        });
        transformedAnalytic.watchTime = invitation?.watchTime ?? 0;
      }

      return transformedAnalytic;
    };

    const analytics = await this.service.queryAnalytics(this.event.id);
    this.analytics = analytics.eventUsers.map(transformEvent);

    // if event is a screening we add the watch time column to the table
    // and we compute the average watch time
    if (this.event.type === 'screening') {
      this.columns.watchTime = 'Watch Time';
      this.initialColumns.push('watchTime');
      const totalWatchTime = this.analytics.reduce((acc, curr) => acc + curr.watchTime, 0);
      this.averageWatchTime = totalWatchTime / this.analytics.length;
    }

    this.cdr.markForCheck();
  }
}
