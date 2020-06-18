import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService, orgName } from '@blockframes/organization/+state';
import { EventService } from '@blockframes/event/+state/';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { InvitationDetailed } from '../../components/guest-table/guest-table.component';
import { getHost } from '@blockframes/invitation/pipes/host.pipe';

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
    'toUser.firstName',
    'toUser.lastName',
    'mode',
    'status',
    'toUser.email',
  ]; //  type movie poster movie name

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
      guest: `${i.toUser.firstName} ${i.toUser.lastName}`,
      email: i.toUser.email,
      mode: i.mode,
      status: i.status,
    }))
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }

}
