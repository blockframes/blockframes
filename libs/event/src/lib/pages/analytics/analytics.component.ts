import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
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
  territories,
  orgActivity,
  invitationStatus
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { where } from 'firebase/firestore';
import { sum } from '@blockframes/utils/utils';
import { formatDate } from '@angular/common';
import { convertToTimeString } from '@blockframes/utils/helpers';
import {
  addNewSheetsInWorkbook,
  addWorksheetColumnsWidth,
  calculateColsWidthFromArray,
  convertArrayToWorksheet,
  createWorkBook,
  ExcelData,
  exportSpreadsheet,
  mergeWorksheetCells,
  setWorksheetColumnsWidth
} from '@blockframes/utils/spreadsheet';

interface WatchTimeInfo {
  name: string, // firstName + lastName
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
  private analytics: WatchTimeInfo[];
  public acceptedAnalytics: WatchTimeInfo[];
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
        this.eventData = event;

        this.eventInvitations = await this.invitationService.getValue([where('type', '==', 'attendEvent'), where('eventId', '==', event.id)]);

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
            orgName: orgName(org),
            orgActivity: org?.activity,
            orgCountry: org?.addresses?.main.country,
            status: i.status
          };
        });
        // Create same analytics but only with 'accepted' status and with a Watchtime > 0
        this.acceptedAnalytics = this.analytics.filter(
          ({status, watchTime}) => status === 'accepted' && watchTime !== 0
        );

        // if event is a screening or a slate presentation we add the watch time column to the table
        // and we compute the average watch time
        const totalWatchTime = sum(this.acceptedAnalytics, a => a.watchTime);
        this.averageWatchTime = totalWatchTime / this.acceptedAnalytics.length;

        this.cdr.markForCheck();
      })
    );
  }

  public async exportTable() {
    try {
      this.exporting = true;
      this.cdr.markForCheck();
      await this.exportExcelFile();
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

  // Create Event Statistic Excel
  private async exportExcelFile() {
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
    const invitationsStatusCounter = {
      accepted: 0,
      pending: 0,
      declined: 0
    };
    const invitationsModeCounter = {
      invitation: 0,
      request: 0
    };
    this.eventInvitations.forEach(({ status, mode }) => {
      if (status === 'accepted') invitationsStatusCounter.accepted++;
      if (status === 'pending') invitationsStatusCounter.pending++;
      if (status === 'declined') invitationsStatusCounter.declined++;
      if (mode === 'invitation') invitationsModeCounter.invitation++;
      if (mode === 'request') invitationsModeCounter.request++;
    });
    const avgWatchTime = convertToTimeString(this.averageWatchTime * 1000);

    // Create data for Archipel Event Summary Tab - With Merge
    const summaryData = new ExcelData();
    summaryData.addLine(
      [ `${ movieTitle } - Archipel Market Screening Report` ],
      {
        merge: [
          { startCell: 1, endCell: 6 }
        ]
      }
    );
    summaryData.addLine([ eventStart ]);
    summaryData.addBlankLine();
    summaryData.addLine([ 'Total number of guests', null, null, null, null, this.eventInvitations.length ]);
    summaryData.addLine([
      'Answers',
      null,
      null,
      null,
      null,
      `${ invitationsStatusCounter.accepted } accepted, ${ invitationsStatusCounter.pending } unanswered, ${ invitationsStatusCounter.declined } declined`
    ]);
    summaryData.addLine([ 'Number of attendees', null, null, null, null, this.acceptedAnalytics.length ]);
    summaryData.addLine([ 'Average watchtime', null, null, null, null, `${avgWatchTime}` ]);
    summaryData.addBlankLine();
    summaryData.addLine([ 'NAME', 'EMAIL', 'COMPANY', 'ACTIVITY', 'TERRITORY', 'WATCHTIME' ]);
    this.acceptedAnalytics.forEach(({ watchTime, email, name, orgActivity: activity, orgCountry, orgName }) => {
      summaryData.addLine([
        name,
        email,
        orgName ? orgName : '-',
        activity ? orgActivity[activity] : '-',
        orgCountry ? territories[orgCountry] : '-',
        watchTime ? `${convertToTimeString(watchTime * 1000)}s` : '-'
      ]);
    });

    // Create data for Archipel Event Guests Tab
    const guestsData = new ExcelData();
    guestsData.addLine(
      [ 'Number of invitations sent', null, null, null, null, invitationsModeCounter.invitation ]
    );
    guestsData.addLine(
      [ 'Number of Requests to join the event', null, null, null, null, invitationsModeCounter.request ]
    );
    guestsData.addLine([
      'Answers',
      null,
      null,
      null,
      null,
      `${ invitationsStatusCounter.accepted } accepted, ${ invitationsStatusCounter.pending } unanswered, ${ invitationsStatusCounter.declined } declined`
    ]);
    guestsData.addBlankLine();
    guestsData.addLine([ 'NAME', 'EMAIL', 'COMPANY', 'TERRITORY', 'ACTIVITY', 'INVITATION STATUS' ]);
    const guestsAccepted = [];
    const guestsPending = [];
    const guestsDeclined = [];
    this.analytics.forEach(
      ({ name, email, orgName, orgCountry, orgActivity: activity, status }) => {
        const guest = [
          name || '-',
          email,
          orgName ? orgName : '-',
          orgCountry ? territories[orgCountry] : '-',
          activity ? orgActivity[activity] : '-',
          invitationStatus[status]
        ];
        if (status === 'accepted') guestsAccepted.push(guest);
        if (status === 'declined') guestsDeclined.push(guest);
        if (status === 'pending') guestsPending.push(guest);
      }
    );
    const guestsStatus = [...guestsAccepted, ...guestsPending, ...guestsDeclined];
    guestsStatus.forEach(row => guestsData.addLine(row));

    // Convert Array to Sheet
    const worksheetSummary = summaryData.createWorksheet();
    const worksheetGuests = guestsData.createWorksheet();

    // Calculate Cols Auto Width
    const summaryArray = summaryData.getArrayOfValue;
    const guestsArray = guestsData.getArrayOfValue;
    summaryArray.splice(0, 8); // to not use the first 6 rows
    guestsArray.splice(0, 5); // to not use the first 4 rows
    addWorksheetColumnsWidth(summaryArray, worksheetSummary);
    addWorksheetColumnsWidth(guestsArray, worksheetGuests);

    // Create Workbook
    const workbook = createWorkBook({
      Title: 'Archipel Market Screening Report',
      Author: 'Archipel Market',
      CreatedDate: new Date()
    });

    // Merge Sheets into Book
    addNewSheetsInWorkbook(
      [
        { name: 'ARCHIPEL EVENT SUMMARY', sheet: worksheetSummary},
        { name: 'ARCHIPEL EVENT GUESTS', sheet: worksheetGuests}
      ],
      workbook
    );

    // Save Excel file
    const filename = `${movieTitle} on Archipel Market ${eventStart} - Report`;
    exportSpreadsheet(workbook, `${filename}.xlsx`);
  }
}
