import { ChangeDetectionStrategy, Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { ActionItem } from '@blockframes/ui';
import {
  InvitationService,
  InvitationQuery,
  InvitationStore
} from '@blockframes/notification';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { AuthQuery } from '@blockframes/auth';
import { InvitationType, Invitation } from '@blockframes/invitation/types';

const invitationActionFromUserToOrganization = (invitation: Invitation) => ({
  matIcon: 'alternate_email',
  title: `Pending request to ${invitation.organization.name}`,
  routerLink: '#',
  description: ''
});

const invitationActionFromOrgToUser = (invitation: Invitation, action: () => void) => ({
  matIcon: 'alternate_email',
  title: `Join ${invitation.organization.name}`,
  action,
  description: ''
});

@Component({
  selector: 'organization-home',
  templateUrl: './organization-home.component.html',
  styleUrls: ['./organization-home.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationHomeComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'organization-home';
  defaultItems: ActionItem[] = [
    {
      routerLink: '../create',
      icon: 'dark_32px_adjustableWrench',
      title: 'Create your organization',
      description: ''
    },
    {
      routerLink: '../find',
      icon: 'dark_32px_MagnifyingGlass',
      title: 'Find your organization',
      description: ''
    }
  ];
  public items$: Observable<ActionItem[]>;
  private sub: Subscription;

  constructor(
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private invitationStore: InvitationStore,
    private authQuery: AuthQuery
  ) {}

  ngOnInit(): void {
    const storeName = this.invitationStore.storeName;
    const queryFn = ref => ref.where('user.uid', '==', this.authQuery.userId).where('status', '==', 'pending');
    this.sub = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();
    this.items$ = this.invitationQuery.selectAll().pipe(
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

  private acceptInvitation(invitation: Invitation) {
    return this.invitationService.acceptInvitation(invitation);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
