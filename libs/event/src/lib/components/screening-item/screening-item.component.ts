import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationQuery, Invitation, InvitationService } from '@blockframes/invitation/+state';
import { ImgRef } from '@blockframes/utils/image-uploader';
import { ScreeningEvent } from '../../+state';

@Component({
  selector: 'event-screening-item',
  templateUrl: './screening-item.component.html',
  styleUrls: ['./screening-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreeningItemComponent {
  public poster: ImgRef;
  public screening: ScreeningEvent;
  public invitation: Invitation;

  @Input() set event(screening: ScreeningEvent) {
    this.screening = screening;
    this.poster = screening.movie?.promotionalElements.poster[0].media;
    this.invitation = this.invitationQuery.getAll().find(e => e.docId === screening.id);
  }

  constructor(
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery
  ) { }

  accept(invitation: Invitation) {
    this.invitationService.acceptInvitation(invitation);
  }

  decline(invitation: Invitation) {
    this.invitationService.declineInvitation(invitation);
  }

  /** Request the owner to accept invitation (automatically accepted if event is public) */
  request(screening: ScreeningEvent) {
    const { ownerId, id } = screening;
    this.invitationService.request('org', ownerId).from('user').to('attendEvent', id);
  }
}
