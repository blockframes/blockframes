import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { InvitationService } from '@blockframes/invitation/+state';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';

@Component({
  selector: 'invitation-form-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
  @Input() docId: string;
  separators = [ENTER, COMMA, SEMICOLON, SPACE];
  form = createAlgoliaUserForm();
  sending = new BehaviorSubject(false);
  constructor(private service: InvitationService) { }

  /** Send an invitation to a list of persons, either to existing user or by creating user  */
  async invite() {
    const emails = this.form.value.map(guest => guest.email);
    this.form.reset([]);
    this.sending.next(true);
    await this.service.invite('user', emails).from('org').to('attendEvent', this.docId);
    this.sending.next(false);
  }
}
