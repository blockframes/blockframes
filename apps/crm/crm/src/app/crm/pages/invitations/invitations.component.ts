import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { InvitationService } from '@blockframes/invitation/service';
import { OrganizationService } from '@blockframes/organization/service';
import { EventService } from '@blockframes/event/service';
import { convertToTimeString, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { getHost } from '@blockframes/invitation/pipes/host.pipe';
import { Movie, Organization, Event, isScreening, InvitationDetailed, getGuest } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { where } from 'firebase/firestore';
import { formatDate } from '@angular/common';

@Component({
  selector: 'crm-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationsComponent implements OnInit {
  public invitations: InvitationDetailed[];
  public invitationListLoaded = false;
  public orgs: Record<string, Organization> = {};
  public events: Record<string, Event> = {};
  public movies: Record<string, Movie> = {};

  constructor(
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private movieService: MovieService,
    private cdRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    const [invitations, events] = await Promise.all([
      this.invitationService.getValue([where('type', '==', 'attendEvent')]),
      this.eventService.getValue(),
    ]);

    const orgIds = Array.from(
      new Set([
        ...invitations.map((invitation) => getHost(invitation, 'org').id),
        ...invitations.map((invitation) => getGuest(invitation, 'user').orgId).filter((id) => !!id),
      ])
    );
    const movieIds = events
      .filter(isScreening)
      .map((event) => event.meta.titleId)
      .filter((id) => !!id);

    const [orgs, movies] = await Promise.all([
      this.orgService.getValue(orgIds),
      this.movieService.getValue(movieIds),
    ]);

    this.invitations = invitations.map((invitation: InvitationDetailed) => {
      invitation.event = events.find((event) => event.id === invitation.eventId);
      invitation.org = orgs.find((org) => org.id === getHost(invitation, 'org').id);
      invitation.guestOrg = orgs.find((org) => org.id === getGuest(invitation, 'user').orgId);

      if (isScreening(invitation.event)) {
        const titleId = invitation.event.meta.titleId;
        if (titleId) {
          try {
            invitation.movie = movies.find((movie) => movie.id === titleId);
          } catch (err) {
            console.log(`Error while loading movie for event : ${invitation.event.id}`);
          }
        }
      }
      return invitation;
    });

    this.invitationListLoaded = true;
    this.cdRef.markForCheck();
  }

  public exportTable() {
    const exportedRows = this.invitations.map(i => ({
      'event id': i.event.id,
      'event name': i.event.title,
      'start date': i.event.start,
      'end date': i.event.end,
      'host organization': i.org.name,
      'host org id': i.org.id,
      'event type': i.event.type,
      title: i.movie ? i.movie.title.international : '--',
      accessibility: i.event.accessibility,
      'invitation date': i.date,
      'guest email': getGuest(i, 'user').email,
      'guest first name': getGuest(i, 'user').firstName || '--',
      'guest last name': getGuest(i, 'user').lastName || '--',
      'guest organization': i.guestOrg?.name || '--',
      'invitation mode': i.mode,
      'invitation status': i.status,
      watchtime: i.watchInfos?.duration !== undefined ? convertToTimeString(i.watchInfos?.duration * 1000) : '--',
      'watchtime (sec)': i.watchInfos?.duration ?? '--',
      'watching ended': i.watchInfos?.date ? formatDate(i.watchInfos?.date, 'MM/dd/yyyy HH:mm', 'en') : '--'
    }));
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }
}
