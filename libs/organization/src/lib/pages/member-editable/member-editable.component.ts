import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { OrganizationQuery, OrganizationMember } from '../../+state';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService, InvitationQuery, Invitation, InvitationStore, InvitationType } from '@blockframes/notification';
import { PermissionsService, PermissionsQuery } from '../../permissions/+state';
import { tap, switchMap, startWith, map, filter } from 'rxjs/operators';
import { createMemberFormList } from '../../forms/member.form';
import { AuthQuery } from '@blockframes/auth';
import { Description } from '@ethersproject/properties';
import { Order } from '@datorama/akita';

@Component({
  selector: 'member-editable',
  templateUrl: './member-editable.component.html',
  styleUrls: ['./member-editable.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberEditableComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'member-editable';

  /** Observable of the selected memberId */
  private selectedMemberId$ = new BehaviorSubject<string>(null);

  public opened = false;

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMember[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsFromOrganization$: Observable<Invitation[]>;

  public isSuperAdmin$: Observable<boolean>;

  public membersFormList = createMemberFormList();

  /** Observable of the selected memberFormGroup in the membersFormList */
  public memberFormGroup$: Observable<FormGroup>;

  public sub: Subscription;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private invitationStore: InvitationStore,
    private permissionsService: PermissionsService,
    private permissionQuery: PermissionsQuery,
    private organizationQuery: OrganizationQuery,
  ) {}

  ngOnInit() {
    this.members$ = this.query.membersWithRole$.pipe(
      tap(members => this.membersFormList.patchValue(members)),
      switchMap(members => this.membersFormList.valueChanges.pipe(startWith(members)))
    );

    /** Return the memberFormGroup linked to the selected memberId */
    this.memberFormGroup$ = this.selectedMemberId$.pipe(
      filter(memberId => !!memberId),
      map(memberId => this.membersFormList.value.findIndex(member => member.uid === memberId)),
      map(index => this.membersFormList.controls[index])
    );

    this.isSuperAdmin$ = this.permissionQuery.isSuperAdmin$;

    const storeName = this.invitationStore.storeName;
    const queryFn = ref => ref.where('organization.id', '==', this.organizationQuery.getValue().org.id).where('status', '==', 'pending');
    this.sub = this.invitationService.syncCollection(queryFn, { storeName }).subscribe();

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

  public async updateRole() {
    try {
      this.permissionsService.updateMembersRole(this.membersFormList.value);
      this.snackBar.open('Roles updated', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
