import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { InvitationService } from '../../+state';
import { UserService } from '@blockframes/user/+state/user.service';
import { EventService } from '@blockframes/event/+state/event.service';
import { PublicOrganization, PublicUser, Invitation } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { App, applicationUrl } from '@blockframes/utils/apps';
import { isMeeting } from '@blockframes/event/+state';
import { isSafari } from '@blockframes/utils/browser/utils';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';
import { Event } from '@blockframes/event/+state';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'invitation-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {
  public applicationUrl = applicationUrl;

  @Input() set invitation(invitation: Invitation) {
    this._invitation = invitation;
    if (invitation.fromUser) {
      this.fromUser = invitation.fromUser;
      this.cdr.markForCheck();

      if (!invitation.fromUser.orgId) return;
      this.organizationService.getValue(this.fromUser.orgId).then(org => {
        this.fromOrg = org
        this.cdr.markForCheck();
      })

    } else if (invitation.fromOrg) {
      this.fromOrg = invitation.fromOrg
      this.cdr.markForCheck();

      if (invitation.type === 'attendEvent') {
        this.eventService.getValue(invitation.eventId).then(event => {
          if (isMeeting(event)) {
            this.eventType = 'meeting';
            this.userService.getValue(event.meta.organizerUid as string).then(user => {
              this.fromUser = user;
              this.cdr.markForCheck();
            })
          }
        })
      }
    }
  };

  _invitation: Invitation;

  fromOrg: PublicOrganization;
  fromUser: PublicUser;
  eventType = 'screening';

  constructor(
    private invitationService: InvitationService,
    private eventService: EventService,
    private organizationService: OrganizationService,
    private userService: UserService,
    private agendaService: AgendaService,
    private cdr: ChangeDetectorRef,
    @Inject(APP) private app: App
  ) {
    //For cypress-environment, keep the event link same as from
    //where app is launced to remove dependency on external host.
    if ('Cypress' in window) {
      const host = `${location.protocol}//${location.hostname}${location.port ? ':' + location.port : ' '}`;
      this.applicationUrl.festival = host;
      this.applicationUrl[this.app] = host;
    }
  }

  get eventLink() {
    if (this._invitation.type === 'attendEvent') {
      if (this._invitation.mode === 'request') {
        return `${this.applicationUrl.festival}/c/o/dashboard/event/${this._invitation.eventId}/edit`;
      } else {
        const urlPart = this.eventType === 'meeting' ? 'lobby' : 'session';
        return `${this.applicationUrl.festival}/event/${this._invitation.eventId}/r/i/${urlPart}`;
      }
    } else if (this._invitation.type === 'joinOrganization') {
      const orgId = this._invitation.fromOrg ? this._invitation.fromOrg.id : this._invitation.toOrg.id;
      return `${this.applicationUrl[this.app]}/c/o/organization/${orgId}/view/members`;
    }
  }

  get targetLink() {
    return isSafari() ? '_blank' : '_self';
  }

  handleInvitation(invitation: Invitation, action: 'acceptInvitation' | 'declineInvitation') {
    this.invitationService[action](invitation);
  }

  exportToCalendar(event: Event) {
    this.agendaService.download([event]);
  }
}
