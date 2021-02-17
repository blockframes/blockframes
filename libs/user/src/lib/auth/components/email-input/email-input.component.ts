import { ChangeDetectionStrategy, Component, EventEmitter, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AngularFireFunctions } from '@angular/fire/functions';
import { PublicOrganization } from "@blockframes/organization/+state";

@Component({
  selector: 'auth-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailInputComponent {

  @Output() organization: EventEmitter<PublicOrganization> = new EventEmitter<PublicOrganization>();
  @Output() showInvitationInput: EventEmitter<boolean> = new EventEmitter<false>();
  private getInvitationLinkedToEmail = this.functions.httpsCallable('getInvitationLinkedToEmail')
  public emailForm = new FormControl();

  constructor(private functions: AngularFireFunctions) { }

  async searchForInvitation() {
    const doc = await this.getInvitationLinkedToEmail(this.emailForm.value).toPromise();

    if (typeof doc === 'object') {
      return this.organization.emit(doc);
    } else {
      return this.showInvitationInput.emit(doc);
    }
  }
}
