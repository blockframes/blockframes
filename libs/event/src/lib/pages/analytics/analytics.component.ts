import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Event } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap, tap } from 'rxjs/operators';
import { EventService } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { EventAnalytics, EventMeta, EventTypes } from '@blockframes/event/+state/event.firestore';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { toLabel } from '@blockframes/utils/pipes';

@Component({
  selector: 'event-analytics-page',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  host: {
    class: 'surface'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit {


  event$: Observable<Event<EventMeta>>;
  private eventType: EventTypes;
  analytics: EventAnalytics[];
  public hasWatchTime = false;
  public exporting = new BehaviorStore(false);
  public averageWatchTime = 0; // in seconds



  constructor(
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private service: EventService,
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Event', 'Event Statistics');

    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.valueChanges(eventId)),
      tap(async event => {
        this.eventType = event.type;
        const analytics = await this.service.queryAnalytics(event.id);

        // transform the analytics records
        this.analytics = analytics.eventUsers.map(analytic => {
          const transformedAnalytic = {
            ...analytic,
            name: `${analytic.firstName} ${analytic.lastName}`,
          };

          // add watch time to the analytic record
          if (this.eventType === 'screening') {
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
        if (this.eventType === 'screening') {
          this.hasWatchTime = true;
          const totalWatchTime = this.analytics.reduce((acc, curr) => acc + curr.watchTime, 0);
          this.averageWatchTime = totalWatchTime / this.analytics.length;
        }

        this.cdr.markForCheck();
      })
    );
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

        if (this.eventType === 'screening') {
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

  // Will be used to show event statistics only if event started
  isEventStarted(event: Event) {
    if (!event) return false;
    const start = event.start;
    return start.getTime() < Date.now();
  }

}
