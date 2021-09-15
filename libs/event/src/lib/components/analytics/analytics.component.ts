import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef } from '@angular/core';;
import { EventService } from '@blockframes/event/+state/event.service';
import { EventAnalytics, EventMeta } from '@blockframes/event/+state/event.firestore';
import { Event } from '@blockframes/event/+state';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { toLabel } from '@blockframes/utils/pipes';

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

  @Input() event: Event<EventMeta>;

  public columns: Record<string, string> = columns;
  public initialColumns = Object.keys(columns);
  public exporting = new BehaviorStore(false);
  public averageWatchTime = 0; // in seconds

  constructor(
    private service: EventService,
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const analytics = await this.service.queryAnalytics(this.event.id);

    // transform the analytics records
    this.analytics = analytics.eventUsers.map(analytic => {
      const transformedAnalytic = {
        ...analytic,
        name: `${analytic.firstName} ${analytic.lastName}`,
      };

      // add watch time to the analytic record
      if (this.event.type === 'screening') {
        // retrieve watch time from invitation
        const [invitation] = this.invitationQuery.getAll({
          // we are looking for invitation between this event and this user id
          filterBy: invit => invit.eventId === analytic.eventId &&
            (
              invit.toUser?.uid === analytic.userId ||
              invit.fromUser?.uid === analytic.userId
            )
        });
        transformedAnalytic.watchTime = invitation?.watchTime ?? 0;
      }

      return transformedAnalytic;
    });

    // if event is a screening we add the watch time column to the table
    // and we compute the average watch time
    if (this.event.type === 'screening') {
      this.columns.watchTime = 'Watch Time';
      if (!this.initialColumns.includes('watchTime')) this.initialColumns.push('watchTime');
      const totalWatchTime = this.analytics.reduce((acc, curr) => acc + curr.watchTime, 0);
      this.averageWatchTime = totalWatchTime / this.analytics.length;
    }

    this.cdr.markForCheck();
  }


  public async exportTable() {
    try {
      this.exporting.value = true;

      const exportedRows = this.analytics.map(analytic => {
        const row: any = {
          'Name': analytic.name,
          'Email Address': analytic.email,
          'Company Name': analytic.orgName ?? '--',
          'Company Activity': analytic.orgActivity ? toLabel(analytic.orgActivity, 'orgActivity') as string : '--',
          'Country': analytic.orgCountry ? toLabel(analytic.orgCountry, 'territories') as string : '--',
        };

        if (this.event.type === 'screening') {
          row['Watch Time'] = analytic.watchTime;
        }
        return row;
      });

      downloadCsvFromJson(exportedRows, 'attendees-list');

      this.exporting.value = false;
    } catch (err) {
      this.exporting.value = false;
    }

  }
}
