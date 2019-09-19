import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { ActionItem } from '@blockframes/ui';
import { Invitation, InvitationService, InvitationType } from '@blockframes/notification';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

const invitationActionFromUserToOrganization = (invitation: Invitation) => ({
  matIcon: 'alternate_email',
  title: `Pending request to ${invitation.organization.name}`,
  routerLink: '#',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
});

const invitationActionFromOrgToUser = (invitation: Invitation, action: () => void) => ({
  matIcon: 'alternate_email',
  title: `Join ${invitation.organization.name}`,
  action,
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
});

@Component({
  selector: 'organization-home',
  templateUrl: './organization-home.component.html',
  styleUrls: ['./organization-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationHomeComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'organization-home';
  defaultItems: ActionItem[] = [
    {
      routerLink: '../create',
      icon: 'adjustableWrench',
      title: 'Create your organization',
      description:
        ''
    },
    {
      routerLink: '../find',
      icon: 'magnifyingGlass',
      title: 'Find your organization',
      description:
        ''
    }
  ];
  public items$: Observable<ActionItem[]>;

  constructor(private invitationService: InvitationService) {}

  ngOnInit(): void {
    this.items$ = this.invitationService.userInvitations$.pipe(
      map(invitations => {
        const actions = invitations.map(invitation => {
          // Create the action item depending on which kind of invitation we have,
          // - If the user created an invitation that is still pending, display with no action,
          // - If an org sent them an invitation, display with an action that let them accept the invite.
          switch (invitation.type) {
            case InvitationType.fromUserToOrganization:
              return invitationActionFromUserToOrganization(invitation);
            case InvitationType.fromOrganizationToUser:
              return invitationActionFromOrgToUser(invitation, () =>
                this.acceptInvitation(invitation)
              );
          }
        });

        return [...actions, ...this.defaultItems];
      })
    );
  }

  private acceptInvitation(invitation) {
    return this.invitationService.acceptInvitation(invitation.id);
  }
}
