import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OrganizationQuery } from '../../+state/organization.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService, InvitationQuery, InvitationStore } from '@blockframes/notification';
import { PermissionsQuery } from '../../permissions/+state';
import { Order } from '@datorama/akita';
import { Invitation, InvitationType } from '@blockframes/invitation/types';
import { OrganizationMember } from '../../member/+state/member.model';
import { MemberService } from '../../member/+state/member.service';
import { MemberQuery } from '../../member/+state/member.query';

@Component({
  selector: 'member-editable',
  templateUrl: './member-editable.component.html',
  styleUrls: ['./member-editable.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberEditableComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'member-editable';

  public orgName: string = this.query.getActive().name;

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMember[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsFromOrganization$: Observable<Invitation[]>;

  public isAdmin$: Observable<boolean>;
  public isSuperAdmin$: Observable<boolean>;

  private invitationSubscription: Subscription;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private invitationStore: InvitationStore,
    private permissionQuery: PermissionsQuery,
    private memberQuery: MemberQuery,
    private memberService: MemberService
  ) {}

  ngOnInit() {
    this.members$ = this.memberQuery.membersWithRole$;

    this.isAdmin$ = this.permissionQuery.isAdmin$;
    this.isSuperAdmin$ = this.permissionQuery.isSuperAdmin$;

    const storeName = this.invitationStore.storeName;
    const queryFn = ref => ref.where('organization.id', '==', this.query.getActiveId()).where('status', '==', 'pending');
    this.invitationSubscription = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();

    this.invitationsToJoinOrganization$ = this.invitationQuery.selectAll({
      filterBy: invitation => invitation.type === InvitationType.fromUserToOrganization,
      sortBy: 'date',
      sortByOrder: Order.DESC
    });

    this.invitationsFromOrganization$ = this.invitationQuery.selectAll({
      filterBy: invitation => invitation.type === InvitationType.fromOrganizationToUser,
      sortBy: 'date',
      sortByOrder: Order.DESC
    });
  }

  public acceptInvitation(invitation: Invitation) {
    this.invitationService.acceptInvitation(invitation);
  }

  public declineInvitation(invitation: Invitation) {
    this.invitationService.declineInvitation(invitation);
  }

  /** Update every user roles in the form list. */
  public updateRole() {
    // try {
    //   if (!this.membersFormList.value.find(member => member.role === UserRole.superAdmin)) {
    //     throw new Error('There must be at least one Super Admin in the organization.')
    //   }
    //   this.permissionsService.updateMembersRole(this.membersFormList.value);
    //   this.snackBar.open('Roles updated', 'close', { duration: 2000 });
    //   this.opened = false;
    // } catch (error) {
    //   this.snackBar.open(error.message, 'close', { duration: 2000 });
    // }
  }

  public removeMember(uid: string) {
    try {
      this.memberService.removeMember(uid);
      this.snackBar.open('Member removed.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.invitationSubscription.unsubscribe();
  }
}
