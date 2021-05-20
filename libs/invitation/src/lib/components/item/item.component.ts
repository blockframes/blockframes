import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation, InvitationService } from '../../+state';
import { UserService } from '@blockframes/user/+state/user.service';
import { EventService } from '@blockframes/event/+state/event.service';
import { PublicUser } from '@blockframes/user/types';
import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { applicationUrl, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'invitation-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {
  public applicationUrl = applicationUrl;
  public app = getCurrentApp(this.routerQuery);

  @Input() set invitation(invitation: Invitation) {
    this._invitation = invitation;
    if (invitation.fromUser) {
      this.fromUser.value = invitation.fromUser;

      if (!invitation.fromUser.orgId) return;
      this.organizationService.getValue(this.fromUser.value.orgId).then(org => {
        this.fromOrg.value = org
      })

    } else if (invitation.fromOrg) {
      this.fromOrg.value = invitation.fromOrg

      if (invitation.type === 'attendEvent') {
        this.eventService.getValue(invitation.eventId).then(event => {
          if (event.type === 'meeting') {
            this.eventType = 'meeting';
            this.userService.getValue(event.meta.organizerUid as string).then(user => {
              this.fromUser.value = user;
            })
          }
        })
      }
    }
  };

  _invitation: Invitation;

  fromOrg = new BehaviorStore<PublicOrganization>(undefined);
  fromUser = new BehaviorStore<PublicUser>(undefined);
  eventType = 'screening';

  constructor(
    private invitationService: InvitationService,
    private eventService: EventService,
    private organizationService: OrganizationService,
    private userService: UserService,
    private routerQuery: RouterQuery
  ) {
    //For cypress-environment, keep the event link same as from
    //where app is launced to remove dependency on external host.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (window.Cypress) {
      const host = `${location.protocol}//${location.hostname}${location.port ? ':' + location.port: ' '}`;
      this.applicationUrl.festival = host;
      this.applicationUrl[this.app] = host;
    }
  }

  get eventLink() {
    if (this._invitation.type === 'attendEvent') {
      if (this._invitation.mode === 'request') {
        return `${this.applicationUrl.festival}/c/o/dashboard/event/${this._invitation.eventId}/edit`;
      } else {
        const urlPart = this.eventType === 'meeting' ? 'lobby': 'session';
        return `${this.applicationUrl.festival}/c/o/marketplace/event/${this._invitation.eventId}/${urlPart}`;
      }
    } else if (this._invitation.type === 'joinOrganization') {
      const orgId = this._invitation.fromOrg ? this._invitation.fromOrg.id : this._invitation.toOrg.id;
      return `${this.applicationUrl[this.app]}/c/o/organization/${orgId}/view/members`;
    }
  }

  handleInvitation(invitation: Invitation, action: 'acceptInvitation' | 'declineInvitation') {
    this.invitationService[action](invitation);
  }
}
