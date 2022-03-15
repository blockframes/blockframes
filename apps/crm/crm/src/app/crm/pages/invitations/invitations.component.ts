import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { EventService } from '@blockframes/event/+state/';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { getHost } from '@blockframes/invitation/pipes/host.pipe';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { Movie, Organization, orgName, Event, isScreening, InvitationDetailed } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';

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
      this.invitationService.getValue((ref) => ref.where('type', '==', 'attendEvent')),
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
    const exportedRows = this.invitations.map((i) => ({
      'event id': i.event.id,
      'event name': i.event.title,
      'start date': i.event.start,
      'end date': i.event.end,
      'host organization': orgName(i.org),
      'host org id': i.org.id,
      'event type': i.event.type,
      title: i.movie ? i.movie.title.international : '--',
      accessibility: i.event.accessibility,
      'invitation date': i.date,
      'guest email': getGuest(i, 'user').email,
      'guest first name': getGuest(i, 'user').firstName || '--',
      'guest last name': getGuest(i, 'user').lastName || '--',
      'guest organization': i.guestOrg ? orgName(i.guestOrg) : '--',
      'invitation mode': i.mode,
      'invitation status': i.status,
    }));
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }
}
