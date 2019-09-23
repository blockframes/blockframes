import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { OrganizationQuery, OrganizationMember } from '../../+state';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService, InvitationQuery, Invitation } from '@blockframes/notification';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { PermissionsService, PermissionsQuery } from '../../permissions/+state';
import { tap, switchMap, startWith, map, filter } from 'rxjs/operators';
import { createMemberFormList } from '../../forms/member.form';

@Component({
  selector: 'member-editable',
  templateUrl: './member-editable.component.html',
  styleUrls: ['./member-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberEditableComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'member-editable';
  private destroyed$ = new Subject();

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

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private permissionsService: PermissionsService,
    private permissionQuery: PermissionsQuery
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
    // TODO : remove this when subscribe is in the guard: /layout guard => ISSUE#641
    this.invitationService.organizationInvitations$.pipe(takeUntil(this.destroyed$));
    this.invitationsToJoinOrganization$ = this.invitationQuery.invitationsToJoinOrganization$;
    this.invitationsFromOrganization$ = this.invitationQuery.invitationsFromOrganization$;
  }

  public openSidenav(memberId: string) {
    this.selectedMemberId$.next(memberId);
    this.opened = true;
  }

  public acceptInvitation(invitationId: string) {
    this.invitationService.acceptInvitation(invitationId);
  }

  public declineInvitation(invitationId: string) {
    this.invitationService.declineInvitation(invitationId);
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
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
