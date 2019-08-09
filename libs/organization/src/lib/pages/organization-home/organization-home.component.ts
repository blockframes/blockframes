import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActionItem } from '@blockframes/ui';
import { InvitationService, InvitationType } from '@blockframes/notification';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'organization-home',
  templateUrl: './organization-home.component.html',
  styleUrls: ['./organization-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationHomeComponent implements OnInit {
  defaultItems: ActionItem[] = [
    {
      routerLink: '../create',
      icon: 'adjustableWrench',
      title: 'Create your organization',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
    },
    {
      routerLink: '../find',
      icon: 'magnifyingGlass',
      title: 'Find your organization',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
    }
  ];
  public items$: Observable<ActionItem[]>;

  constructor(private invitationService: InvitationService) {}

  ngOnInit(): void {
    this.items$ = this.invitationService.userInvitations$.pipe(
      map(invitations => {
        const actions = invitations.map(invitation => {
          switch (invitation.type) {
            case InvitationType.fromUserToOrganization:
              return {
                matIcon: 'alternate_email',
                title: `Pending request to ${invitation.organization.name}`,
                routerLink: '#',
                description:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
              };
            case InvitationType.fromOrganizationToUser:
              return {
                matIcon: 'alternate_email',
                title: `Join ${invitation.organization.name}`,
                action: () => this.acceptInvitation(invitation),
                description:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
              };
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
