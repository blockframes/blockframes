import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService, Organization, orgName } from '@blockframes/organization/+state';
import { EventService, Event } from '@blockframes/event/+state/';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { getHost } from '@blockframes/invitation/pipes/host.pipe';
import { PublicUser } from '@blockframes/user/types';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { MovieService, Movie } from '@blockframes/movie/+state';

// @TODO (#2952) find better name and location
export interface InvitationDetailed extends Invitation {
  org: Organization,
  guestOrg?: Organization,
  event: Event,
  guest?: PublicUser,
  movie?: Movie,
};

@Component({
  selector: 'admin-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationsComponent implements OnInit {

  public invitations: InvitationDetailed[];

  public columns: string[] = [
    'id',
    'org',
    'event.title',
    'event.id',
    'event.start',
    'event.end',
    'event.type',
    'movie',
    'event.isPrivate',
    'guest.email',
    'guest.firstName',
    'guest.lastName',
    'guestOrg',
    'date',
    'mode',
    'status',
  ];

  constructor(
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private movieService: MovieService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const invitations = await this.invitationService.getValue(ref => ref.where('type', '==', 'attendEvent'));

    const orgs = invitations.map(async i => {
      const invitation: InvitationDetailed = { ...i } as InvitationDetailed;
      invitation.org = await this.orgService.getValue(getHost(invitation, 'org').id);
      invitation.event = await this.eventService.getValue(invitation.docId);
      const guestOrgId = getGuest(i, 'user').orgId;
      if (guestOrgId) {
        invitation.guestOrg = await this.orgService.getValue(guestOrgId);
      }

      if (invitation.event.type === 'screening') {
        const titleId = invitation.event.meta.titleId as string;
        if (titleId) {
          try {
            invitation.movie = await this.movieService.getValue(titleId);
          } catch (err) {
            console.log(`Error while loading movie for event : ${invitation.event.id}`);
          }
        }
      }
      return invitation;
    })

    this.invitations = await Promise.all(orgs);
    this.cdRef.markForCheck();
  }

  public exportTable() {
    const exportedRows = this.invitations.map(i => ({
      'event id': i.id,
      'event name': i.event.title,
      'start date': i.event.start,
      'end date': i.event.end,
      'host organization': orgName(i.org),
      'host org id': i.org.id,
      'event type': i.event.type,
      'title': i.movie ? i.movie.main.title.international : '--',
      'privacy status': i.event.isPrivate ? 'private' : 'public',
      'invitation date': i.date,
      'guest email': getGuest(i, 'user').email,
      'guest first name': getGuest(i, 'user').firstName || '--',
      'guest last name': getGuest(i, 'user').lastName || '--',
      'guest organization': i.guestOrg ? orgName(i.guestOrg) : '--',
      'invitation mode': i.mode,
      'invitation status': i.status,
    }))
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }

}
