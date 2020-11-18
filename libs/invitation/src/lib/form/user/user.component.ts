import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { Invitation, InvitationQuery, InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: '[docId] invitation-form-user',
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
  @Input() docId: string;

  @Input() invitations: Invitation[] = [];

  /**
   * This parameter is useful to create invitation on behalf of someone else in the admin-panel.
   * For use in the apps, it should be empty, and the invitation service will retrieve the needed info
   */
  @Input() ownerId: string;

  /**
   * Maximum number of persons that can be invited for a specific `docId`.
   * This limit also take into account the previously sent invitations.
   * The limit input is a _maximum_, it can be reached but not passed.
   *
   * i.e. if limit = 10, we can send 10 invitations but not 11.
   */
  @Input() limit = Infinity;

  separators = [ENTER, COMMA, SEMICOLON, SPACE];
  form = createAlgoliaUserForm(Validators.maxLength(50));
  currentLimit$: Observable<{canSend: boolean, total: number}>;
  sending = new BehaviorSubject(false);
  hasLimit: boolean;

  constructor(
    private invitationService: InvitationService,
    private invitationQuery: InvitationQuery,
    private orgService: OrganizationService,
  ) {}

  ngOnInit() {

    this.hasLimit = this.limit !== Infinity;

    const existingInvitationNumber$ = this.invitationQuery.selectAll({filterBy: invitation => invitation.docId === this.docId}).pipe(
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
      map(([existing, current]) => ({canSend: existing + current <= this.limit, total: existing + current})),
      startWith({canSend: false, total: -1}),
    )
  }

  /** Send an invitation to a list of persons, either to existing user or by creating user  */
  async invite() {
    if (this.form.valid && this.form.value.length) {
      const emails = this.form.value.map(guest => guest.email);
      this.form.reset([]);
      this.sending.next(true);
      const org = this.ownerId ? await this.orgService.getValue(this.ownerId) : undefined;
      await this.invitationService.invite('user', emails).from('org', org).to('attendEvent', this.docId);
      this.sending.next(false);
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
