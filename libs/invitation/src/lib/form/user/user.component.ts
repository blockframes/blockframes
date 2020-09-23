import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { Validators } from '@angular/forms';

@Component({
  selector: 'invitation-form-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
  @Input() docId: string;
  @Input() invitations: Invitation[] = [];

  @Input() ownerId: string;
  separators = [ENTER, COMMA, SEMICOLON, SPACE];
  form = createAlgoliaUserForm(Validators.maxLength(50));
  sending = new BehaviorSubject(false);
  constructor(
    private service: InvitationService,
    private orgService: OrganizationService,
  ) {}

  /** Send an invitation to a list of persons, either to existing user or by creating user  */
  async invite() {
    if (this.form.valid && this.form.value.length) {
      const emails = this.form.value.map(guest => guest.email);
      this.form.reset([]);
      this.sending.next(true);
      const org = this.ownerId ? await this.orgService.getValue(this.ownerId) : undefined;
      await this.service.invite('user', emails).from('org', org).to('attendEvent', this.docId);
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
