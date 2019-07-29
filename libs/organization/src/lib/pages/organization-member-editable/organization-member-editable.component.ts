import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OrganizationQuery, OrganizationMember } from '../../+state';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService, InvitationQuery, Invitation } from '@blockframes/notification';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'organization-member-editable',
  templateUrl: './organization-member-editable.component.html',
  styleUrls: ['./organization-member-editable.component.scss']
})
export class OrganizationMemberEditableComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();

  public opened = false;

  /** The control to send an invitation with the given email */
  public emailControl = new FormControl('', Validators.email);

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMember[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsToOrganization$: Observable<Invitation[]>;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private organizationQuery: OrganizationQuery,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery
  ) {}

  ngOnInit() {
    this.members$ = this.query.members$;
    this.members$.subscribe(m => console.log(m))

    // TODO : remove this when subscribe is in the guard: /layout guard => ISSUE#641
    this.invitationService.organizationInvitations$.pipe(takeUntil(this.destroyed$)).subscribe();
    this.invitationsToJoinOrganization$ = this.invitationQuery.invitationsToJoinOrganization$;
    this.invitationsToOrganization$ = this .invitationQuery.invitationsToOrganization$;
  }

  public openSidenav(member: OrganizationMember) {
    // TODO: use member for set form
    this.opened = true;
  }

  public async addMember() {
    try {
      if (this.emailControl.invalid) throw new Error('Please enter a valid email address');
      // TODO: implement service for create a new invitation
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

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
