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
  public members$: Observable<OrganizationMember[]>;
  public emailControl = new FormControl('', Validators.email);
  public invitations$: Observable<Invitation[]>;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery
  ) {}

  ngOnInit() {
    this.members$ = this.query.select(state => state.org.members);

    // TODO : remove this when subscribe is in the guard: /layout guard => ISSUE#641
    this.invitationService.organizationInvitations$.pipe(takeUntil(this.destroyed$)).subscribe();
    this.invitations$ = this.invitationQuery.selectAll();
  }

  public openSidenav(member: OrganizationMember) {
    // TODO: use member for set form
    this.opened = true;
  }

  public async addMember() {
    try {
      if (this.emailControl.invalid) throw new Error('Please enter a valid email address');
      // TODO: implement service for create a new invitation
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public acceptInvitation(invitationId: string) {
    this.invitationService.acceptInvitation(invitationId);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
