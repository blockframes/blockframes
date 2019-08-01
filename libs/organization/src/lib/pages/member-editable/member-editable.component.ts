import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OrganizationQuery, OrganizationMemberWithRole } from '../../+state';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService, InvitationQuery, Invitation } from '@blockframes/notification';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { PermissionsQuery, PermissionsService } from '../../permissions/+state';
import { FormList } from '@blockframes/utils';
import { tap, switchMap, startWith, map } from 'rxjs/operators';

function createMemberRoleControl(member: OrganizationMemberWithRole) {
  return new FormGroup({
    uid: new FormControl(member.uid),
    role: new FormControl(member.role)
  });
}

@Component({
  selector: 'member-editable',
  templateUrl: './member-editable.component.html',
  styleUrls: ['./member-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberEditableComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();

  public opened = false;

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMemberWithRole[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsToOrganization$: Observable<Invitation[]>;

  public isSuperAdmin$: Observable<boolean>;

  public membersGroup = new FormGroup({
    members: FormList.factory([], createMemberRoleControl)
  });

  /** The index of selected member permits to open the sidenav */
  public membersIndex: number;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private permissionsQuery: PermissionsQuery,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    // TODO: this observable does not change correctly when a member is updated: issue#707
    this.members$ = this.query.membersWithRole$.pipe(
      tap(members => this.membersGroup.get('members').patchValue(members)),
      switchMap(members => this.membersGroup.get('members').valueChanges.pipe(startWith(members))),
    );

    this.isSuperAdmin$ = this.permissionsQuery.isSuperAdmin$;

    // TODO : remove this when subscribe is in the guard: /layout guard => ISSUE#641
    this.invitationService.organizationInvitations$.pipe(takeUntil(this.destroyed$)).subscribe();
    this.invitationsToJoinOrganization$ = this.invitationQuery.invitationsToJoinOrganization$;
    this.invitationsToOrganization$ = this.invitationQuery.invitationsToOrganization$;
  }

  public openSidenav(memberId: string) {
    /*
      We need to find the right index of the formList
       because the index sent by the mat-table can change according to the sort
    */
    const members = this.membersGroup.get('members').value;
    this.membersIndex = members.findIndex(member => member.uid === memberId);
    this.opened = true;
  }

  public acceptInvitation(invitationId: string) {
    this.invitationService.acceptInvitation(invitationId);
  }

  public declineInvitation(invitationId: string) {
    this.invitationService.declineInvitation(invitationId);
  }

  public get members() {
    return this.membersGroup.get('members');
  }

  public async updateRole() {
    console.log(this.membersGroup.get('members').value);
    // try {
    //   if (this.roleControl.value !== this.selected.role) {
    //     // TODO: update switchRoles() with transaction and be able to add new roles: issue#706
    //     await this.permissionsService.switchRoles(this.selected.uid);
    //     this.snackBar.open('Role updated', 'close', { duration: 2000 });
    //   } else {
    //     throw new Error('The member already has this role');
    //   }
    // } catch (error) {
    //   this.snackBar.open(error.message, 'close', { duration: 2000 });
    // }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
