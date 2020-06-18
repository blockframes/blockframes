import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { OrganizationService, orgName, Organization } from '@blockframes/organization/+state';
import { EventService, Event } from '@blockframes/event/+state/';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { getHost } from '@blockframes/invitation/pipes/host.pipe';
import { PublicUser } from '@blockframes/user/types';
import { getGuest } from '@blockframes/invitation/pipes/guest.pipe';
import { MovieService, Movie } from '@blockframes/movie/+state';

// @TODO (#2952) find better name and location
export interface InvitationDetailed extends Invitation {
  org: Organization,
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
    'event.id',
    'event.title',
    'event.start',
    'event.end',
    'event.type',
    'date',
    'guest.firstName',
    'guest.lastName',
    'mode',
    'status',
    'guest.email',
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
      id: i.id,
      org: orgName(i.org),
      event: i.event.title,
      date: i.date,
      guest: `${getGuest(i, 'user').firstName} ${getGuest(i, 'user').lastName}`,
      email: getGuest(i, 'user').email,
      mode: i.mode,
      status: i.status,
    }))
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }

}
