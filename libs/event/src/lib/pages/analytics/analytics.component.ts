import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap, tap } from 'rxjs/operators';
import { EventService } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { InvitationService } from '@blockframes/invitation/+state';
import {
  Invitation,
  InvitationStatus,
  orgName,
  Screening,
  Meeting,
  Slate,
  Event,
  EventMeta,
  EventTypes,
  territories,
  orgActivity,
  invitationStatus
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { formatDate } from '@angular/common';
import XLSX from "xlsx";
import { where } from 'firebase/firestore';
import { sum } from '@blockframes/utils/utils';

interface WatchTimeInfo {
  name: string, // firstName + lastName
  firstname: string,
  lastname: string,
  email: string,
  orgName?: string,
  orgActivity?: string,
  orgCountry?: string,
  watchTime?: number, // in seconds
  status: InvitationStatus
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
  attendeesAnalytics: WatchTimeInfo[];
  public hasWatchTime = false;
  public exporting = false
  public averageWatchTime = 0; // in seconds
  public dataMissing = '(Not Registered)';
  private eventInvitations: Invitation[];
  private eventData: Event<Screening | Meeting | Slate | unknown>;

  constructor(
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
    private movieService: MovieService,
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
        this.eventData = event;

        const allInvitations = await this.invitationService.getValue([where('type', '==', 'attendEvent'), where('eventId', '==', this.eventData.id)]);

        // we are looking for invitations related to this event
        this.eventInvitations = allInvitations.filter(invit => {
          if (invit.eventId !== event.id) return false;
          return true;
        });

        const allOrgIds = this.eventInvitations.map(i => i.fromUser?.orgId || i.toUser?.orgId).filter(orgId => !!orgId);
        const orgIds = Array.from(new Set(allOrgIds));
        const orgs = await Promise.all(orgIds.map(orgId => this.orgService.getValue(orgId)));

        this.analytics = this.eventInvitations.map(i => {
          const user = i.fromUser || i.toUser;
          const name = user.lastName && user.firstName ? `${user.firstName} ${user.lastName}` : this.dataMissing;
          const org = orgs.find(o => o.id === user.orgId);
          return {
            email: user.email,
            watchTime: i.watchTime || 0,
            name,
            firstname: user?.firstName || this.dataMissing,
            lastname: user?.lastName || this.dataMissing,
            orgName: orgName(org),
            orgActivity: org?.activity,
            orgCountry: org?.addresses?.main.country,
            status: i.status
          };
        });
        // Create same analitics but only with 'accepted' status
        this.attendeesAnalytics = this.analytics.filter(({status}) => status === 'accepted');

        // if event is a screening or a slate presentation we add the watch time column to the table
        // and we compute the average watch time
        if (this.eventType === 'screening' || this.eventType === 'slate') {
          this.hasWatchTime = true;
          const totalWatchTime = sum(this.attendeesAnalytics, a => a.watchTime);
          this.averageWatchTime = totalWatchTime / this.attendeesAnalytics.length;
        }

        this.cdr.markForCheck();
      })
    );
  }

  public async exportTable() {
    try {
      this.exporting = true;
      this.cdr.markForCheck();
      await this.createEventStatistics();
      this.exporting = false;
    } catch (err) {
      this.exporting = false;
    }
    this.cdr.markForCheck();
  }

  // Will be used to show event statistics only if event started
  isEventStarted(event: Event) {
    if (!event) return false;
    const start = event.start;
    return start.getTime() < Date.now();
  }

  // Calculate the width of cols from text within cell
  private calculateColsWidth(sheetArray: (string | number)[][]): number[] {
    const maxCols: number[] = Array(sheetArray[0].length).fill(15);
    for(let row = 0; row < sheetArray.length; row++) {
      for(let col = 0; col < sheetArray[row].length; col++) {
        const currentNumber = maxCols[col]
        const newNumber = sheetArray[row][col] ? `${sheetArray[row][col]}`.length + 5 : 0
        if (currentNumber < newNumber) maxCols[col] = newNumber
      }
    }
    return maxCols;
  }

  // Create Event Statistic Excel
  private async createEventStatistics() {
    let movieTitle: string;
    if (this.eventData.type === 'screening') {
      const titleId = (this.eventData.meta as Screening).titleId;
      const { title } = await this.movieService.getValue(titleId);
      movieTitle = title.international;
    }
    else if (this.eventData.type === 'slate') {
      const titleIds = (this.eventData.meta as Slate).titleIds;
      const movies = await this.movieService.getValue(titleIds);
      movieTitle = movies.map(({ title }) => title.international).join(', ');
    }
    const eventStart = formatDate(this.eventData.start, 'MM/dd/yyyy', 'en');

    const invitationStatusCount = [0, 0, 0, 0, 0];
    this.eventInvitations.forEach(({ status, mode }) => {
      if (status === 'accepted') invitationStatusCount[0]++;
      else if (status === 'pending') invitationStatusCount[1]++;
      else if (status === 'declined') invitationStatusCount[2]++;
      if (mode === 'invitation') invitationStatusCount[3]++;
      else if (mode === 'request') invitationStatusCount[4]++;
    });
    const [
      acceptedCount,
      pendingCount,
      declinedCount,
      invitationCount,
      requestCount
    ] = invitationStatusCount;

    const [avgWatchTimeMins, avgWatchTimeSecs] = formatDate(this.averageWatchTime * 1000, 'm,ss', 'en').split(',') || [0, 0];

    // Create data for Archipel Event Summary Tab
    const worksheet_summary = [
      [ `${ movieTitle } - Archipel Market Screening Report - ${ eventStart }` ],
      [ 'Total number of guests', null, null, null, null, this.eventInvitations.length ],
      [ 'Answers', null, null, null, null, `${ acceptedCount } accepted, ${ pendingCount } unanswered, ${ declinedCount } declined` ],
      [ 'Number of attendees', null, null, null, null, this.attendeesAnalytics.length ],
      [ 'Average watchtime', null, null, null, null, `${avgWatchTimeMins}min ${avgWatchTimeSecs}s` ],
      null,
      [ 'NAME', 'EMAIL', 'COMPANY', 'ACTIVITY', 'TERRITORY', 'WATCHTIME' ]
    ];
    this.attendeesAnalytics.forEach(({ watchTime, email, name, orgActivity: activity, orgCountry, orgName }) => {
      const [watchTimeMins, watchTimeSecs] = formatDate((watchTime || 0) * 1000, 'm,ss', 'en').split(',');
      worksheet_summary.push([
        name,
        email,
        orgName ? orgName : '-',
        activity ? orgActivity[activity] : '-',
        orgCountry ? territories[orgCountry] : '-',
        watchTime ? `${watchTimeMins}min ${watchTimeSecs}s` : '-'
      ]);
    });

    // Create data for Archipel Event Guests Tab
    let worksheet_guests = [
      [ 'Number of invitations sent', null, null, null, null, null, invitationCount ],
      [ 'Number of Requests to join the event', null, null, null, null, null, requestCount ],
      [ 'Answers:', null, null, null, null, null, `${ acceptedCount } accepted, ${ pendingCount } unanswered, ${ declinedCount } declined` ],
      [],
      [ 'FIRST NAME', 'LAST NAME', 'EMAIL', 'COMPANY', 'TERRITORY', 'ACTIVITY', 'INVITATION STATUS' ]
    ];
    const guestsAccepted = [];
    const guestsPending = [];
    const guestsDeclined = [];
    this.analytics.forEach(
      ({ firstname, lastname, email, orgName, orgCountry, orgActivity: activity, status }) => {
        const guest = [
          firstname,
          lastname,
          email,
          orgName ? orgName : '-',
          orgCountry ? territories[orgCountry] : '-',
          activity ? orgActivity[activity] : '-',
          invitationStatus[status]
        ];
        if (status === 'accepted') {
          guestsAccepted.push(guest);
        }
        else if (status === 'declined') {
          guestsDeclined.push(guest);
        }
        else if (status === 'pending') {
          guestsPending.push(guest);
        }
      }
    );
    worksheet_guests = worksheet_guests.concat(guestsAccepted, guestsPending, guestsDeclined);

    // Convert Array to Sheet
    const worksheetSummary = XLSX.utils.aoa_to_sheet(worksheet_summary);
    const worksheetGuests = XLSX.utils.aoa_to_sheet(worksheet_guests);

    // Merge Cells
    if(!worksheetSummary['!merges']) worksheetSummary['!merges'] = [];
    const summaryMerge = XLSX.utils.decode_range('A1:F1');
    worksheetSummary['!merges'].push(summaryMerge);
    if(!worksheetGuests['!merges']) worksheetGuests['!merges'] = [];
    const guestsMerge1 = XLSX.utils.decode_range('A1:C1');
    const guestsMerge2 = XLSX.utils.decode_range('A2:C2');
    const guestsMerge3 = XLSX.utils.decode_range('A3:C3');
    worksheetGuests['!merges'].push(guestsMerge1, guestsMerge2, guestsMerge3);

    // Calculate Cols Auto Width
    worksheet_summary.splice(0, 6); // to not use the first 6 rows
    worksheet_guests.splice(0, 4); // to not use the first 4 rows
    const maxSummaryCols = this.calculateColsWidth(worksheet_summary);
    const maxGuestsCols = this.calculateColsWidth(worksheet_guests);
    worksheetSummary['!cols'] = maxSummaryCols.map((n: number) => ({ width: n }));
    worksheetGuests['!cols'] = maxGuestsCols.map((n: number) => ({ width: n }));

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: 'Archipel Market Screening Report',
      Author: 'Archipel Market',
      CreatedDate: new Date()
    };

    // Merge Sheets into Book
    XLSX.utils.book_append_sheet(workbook, worksheetSummary, 'ARCHIPEL EVENT SUMMARY');
    XLSX.utils.book_append_sheet(workbook, worksheetGuests, 'ARCHIPEL EVENT GUESTS');

    // Save Excel file
    const filename = `${movieTitle} on Archipel Market ${eventStart} - Report`;
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
}
