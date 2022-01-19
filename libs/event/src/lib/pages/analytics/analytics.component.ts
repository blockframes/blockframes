import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Event } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap, tap } from 'rxjs/operators';
import { EventService } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { EventMeta, EventTypes } from '@blockframes/event/+state/event.firestore';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { toLabel } from '@blockframes/utils/pipes';
import { orgName } from '@blockframes/organization/+state/organization.firestore';
import { OrganizationService } from '@blockframes/organization/+state';

interface WatchTimeInfo {
  name: string, // firstName + lastName
  email: string,
  orgName?: string,
  orgActivity?: string,
  orgCountry?: string,
  watchTime?: number, // in seconds
}

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
  analytics: WatchTimeInfo[];
  public hasWatchTime = false;
  public exporting = new BehaviorStore(false);
  public averageWatchTime = 0; // in seconds

  constructor(
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private service: EventService,
    private invitationQuery: InvitationQuery,
    private cdr: ChangeDetectorRef,
    private orgService: OrganizationService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Event', 'Event Statistics');

    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.valueChanges(eventId)),
      tap(async event => {
        this.eventType = event.type;


        const invitations = this.invitationQuery.getAll({
          // we are looking for invitations related to this event
          filterBy: invit => invit.eventId === event.id && !!invit.watchTime
        });

        const orgIds = Array.from(new Set(invitations.map(i => i.fromUser?.orgId || i.toUser?.orgId).filter(orgId => !!orgId)));
        const orgs = await Promise.all(orgIds.map(orgId => this.orgService.getValue(orgId)));

        this.analytics = invitations.map(i => {
          const user = i.fromUser || i.toUser;
          const name = user.lastName && user.firstName ? `${user.firstName} ${user.lastName}` : 'Not Registered';
          const org = orgs.find(o => o.id === user.orgId);
          return {
            email: user.email,
            watchTime: i.watchTime,
            name,
            orgName: org ? orgName(org) : undefined,
            orgActivity: org?.activity || undefined,
            orgCountry: org?.addresses?.main.country || undefined
          };
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
