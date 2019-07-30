import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OrganizationQuery, OrganizationMemberWithRole } from '../../+state';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService, InvitationQuery, Invitation } from '@blockframes/notification';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { PermissionsQuery, PermissionsService } from '../../permissions/+state';

@Component({
  selector: 'member-editable',
  templateUrl: './member-editable.component.html',
  styleUrls: ['./member-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberEditableComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();

  public opened = false;

  /** The selected member open in the sidenav */
  public selected: OrganizationMemberWithRole;

  /** The control to send an invitation with the given email */
  public emailControl = new FormControl('', Validators.email);

  /** The control to choose the role of member */
  public roleControl = new FormControl();

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMemberWithRole[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsToOrganization$: Observable<Invitation[]>;

  public isSuperAdmin$: Observable<boolean>;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private organizationQuery: OrganizationQuery,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private permissionsQuery: PermissionsQuery,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    // TODO: this observable does not change correctly when a member is updated: issue#707
    this.members$ = this.query.membersWithRole$;
    this.isSuperAdmin$ = this.permissionsQuery.isSuperAdmin$;

    // TODO : remove this when subscribe is in the guard: /layout guard => ISSUE#641
    this.invitationService.organizationInvitations$.pipe(takeUntil(this.destroyed$)).subscribe();
    this.invitationsToJoinOrganization$ = this.invitationQuery.invitationsToJoinOrganization$;
    this.invitationsToOrganization$ = this.invitationQuery.invitationsToOrganization$;
  }

  public openSidenav(member: OrganizationMemberWithRole) {
    this.selected = member;
    this.roleControl.setValue(this.selected.role);
    this.opened = true;
  }

  public async addMember() {
    try {
      if (this.emailControl.invalid) throw new Error('Please enter a valid email address');
      const userEmail = this.emailControl.value;
      const organizationId = this.organizationQuery.id;
      await this.invitationService.sendInvitationToUser(userEmail, organizationId);
      this.snackBar.open('The invitation was created', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public acceptInvitation(invitationId: string) {
    this.invitationService.acceptInvitation(invitationId);
  }

  public declineInvitation(invitationId: string) {
    this.invitationService.declineInvitation(invitationId);
  }

  public async updateRole() {
    try {
      if (this.roleControl.value !== this.selected.role) {
        // TODO: update switchRoles() with transaction and be able to add new roles: issue#706
        await this.permissionsService.switchRoles(this.selected.uid);
        this.snackBar.open('Role updated', 'close', { duration: 2000 });
      } else {
        throw new Error('The member already has this role');
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
