import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { Invitation, InvitationQuery, InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: '[eventId] invitation-form-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {

  /**
   * Id of the document the invitations will refer to.
   * This can be an Organization or an Event for example.
   */
  @Input() eventId: string;

  @Input() invitations: Invitation[] = [];

  /**
   * This parameter is useful to create invitation on behalf of someone else in the admin-panel.
   * For use in the apps, it should be empty, and the invitation service will retrieve the needed info
   */
  @Input() ownerOrgId: string;

  /**
   * Maximum number of persons that can be invited for a specific `eventId`.
   * This limit also take into account the previously sent invitations.
   * The limit input is a _maximum_, it can be reached but not passed.
   *
   * i.e. if limit = 10, we can send 10 invitations but not 11.
   */
  @Input() limit = Infinity;

  separators = [ENTER, COMMA, SEMICOLON];
  form = createAlgoliaUserForm(Validators.maxLength(50));
  currentLimit$: Observable<{ canSend: boolean, total: number }>;
  sending = new BehaviorSubject(false);
  hasLimit: boolean;

  constructor(
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private orgService: OrganizationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {

    this.hasLimit = this.limit !== Infinity;

    const existingInvitationNumber$ = this.invitationQuery.selectAll({ filterBy: invitation => invitation.eventId === this.eventId }).pipe(
      map(invitations => invitations.length)
    );
    const inFormInvitationNumber$ = this.form.valueChanges.pipe(
      map(users => users.length),
      startWith(this.form.value.length),
    );

    this.currentLimit$ = combineLatest([
      existingInvitationNumber$,
      inFormInvitationNumber$,
    ]).pipe(
      map(([existing, current]) => ({ canSend: existing + current <= this.limit, total: existing + current })),
      startWith({ canSend: false, total: -1 }),
    )
  }

  /** Send an invitation to a list of persons, either to existing user or by creating user  */
  async invite() {
    if (this.form.valid && this.form.value.length) {
      try {
        const unique = Array.from(new Set(this.form.value.map(guest => guest.email.trim().toLowerCase())));
        const emails = unique.filter(email => !this.invitations.some(inv => inv.toUser?.email === email));
        if (unique.length > emails.length) {
          throw new Error('There is already an invitation existing for one or more of these users');
        }
        this.form.reset([]);
        this.sending.next(true);
        const fromOrg = this.ownerOrgId ? await this.orgService.getValue(this.ownerOrgId) : undefined;
        await this.invitationService.invite(emails, fromOrg).to('attendEvent', this.eventId);
        this.sending.next(false);
      } catch (error) {
        this.sending.next(false);
        this.snackBar.open(error.message, 'close', { duration: 5000 });
      }
    }
  }

  /** Add the SPACE separator if the user pastes email addresses and remove it if the user types something*/
  onInputFilling(event: InputEvent) {
    if (event.inputType === 'insertFromPaste') {
      this.separators.push(SPACE);
    } else {
      if (this.separators.includes(SPACE)) {
        const index = this.separators.indexOf(SPACE);
        this.separators.splice(index, 1);
      }
    }
  }

  /** Send only the first emails based on the maxlength */
  spliceAndSend(amount: number) {
    const value = this.form.value;
    const first = value.splice(0, amount);
    this.form.reset(first);
    // Wait a little to avoid animation overlap
    setTimeout(() => this.invite(), 200);
  }
}
