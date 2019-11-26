import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { OrganizationQuery } from '../../+state/organization.query';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService, InvitationQuery, InvitationStore } from '@blockframes/notification';
import { PermissionsService, PermissionsQuery } from '../../permissions/+state';
import { tap, switchMap, startWith, map, filter } from 'rxjs/operators';
import { createMemberFormList } from '../../forms/member.form';
import { Order } from '@datorama/akita';
import { Invitation, InvitationType } from '@blockframes/invitation/types';
import { OrganizationMember } from '../../member/+state/member.model';
import { MemberService } from '../../member/+state/member.service';
import { MemberQuery } from '../../member/+state/member.query';
import { UserRole } from '@blockframes/permissions/types';

@Component({
  selector: 'member-editable',
  templateUrl: './member-editable.component.html',
  styleUrls: ['./member-editable.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberEditableComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'member-editable';

  public orgName: string = this.query.getActive().name

  /** Observable of the selected memberId */
  private selectedMemberId$ = new BehaviorSubject<string>(null);

  public opened = false;

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMember[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsFromOrganization$: Observable<Invitation[]>;

  public isAdmin$: Observable<boolean>;
  public isSuperAdmin$: Observable<boolean>;

  public membersFormList = createMemberFormList();

  /** Observable of the selected memberFormGroup in the membersFormList */
  public memberFormGroup$: Observable<FormGroup>;

  private invitationSubscription: Subscription;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private invitationStore: InvitationStore,
    private permissionsService: PermissionsService,
    private permissionQuery: PermissionsQuery,
    private memberQuery: MemberQuery
  ) {}

  ngOnInit() {
    this.members$ = this.memberQuery.membersWithRole$.pipe(
      tap(members => this.membersFormList.patchValue(members)),
      switchMap(members => this.membersFormList.valueChanges.pipe(startWith(members)))
    );

    /** Return the memberFormGroup linked to the selected memberId */
    this.memberFormGroup$ = this.selectedMemberId$.pipe(
      filter(memberId => !!memberId),
      map(memberId => this.membersFormList.value.findIndex(member => member.uid === memberId)),
      map(index => this.membersFormList.controls[index])
    );

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

  public openSidenav(memberId: string) {
    this.selectedMemberId$.next(memberId);
    this.opened = true;
  }

  public acceptInvitation(invitation: Invitation) {
    this.invitationService.acceptInvitation(invitation);
  }

  public declineInvitation(invitation: Invitation) {
    this.invitationService.declineInvitation(invitation);
  }

  /** Update every user roles in the form list. */
  public updateRole() {
    try {
      if (!this.membersFormList.value.find(member => member.role === UserRole.superAdmin)) {
        throw new Error('There must be at least one Super Admin in the organization.')
      }
      this.permissionsService.updateMembersRole(this.membersFormList.value);
      this.snackBar.open('Roles updated', 'close', { duration: 2000 });
      this.opened = false;
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.invitationSubscription.unsubscribe();
  }
}
