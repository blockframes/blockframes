import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AngularFireFunctions } from '@angular/fire/functions';
import { PublicOrganization } from "@blockframes/organization/+state";

@Component({
  selector: 'auth-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailInputComponent implements OnInit {

  @Output() private readonly organization = new EventEmitter<PublicOrganization>();
  @Output() showInvitationInput = new EventEmitter<boolean>(false);

  private getInvitationLinkedToEmail = this.functions.httpsCallable('getInvitationLinkedToEmail')
  public emailForm = new FormControl();

  constructor(private functions: AngularFireFunctions) { }

  ngOnInit() {
    this.emailForm.valueChanges.subscribe(_ => this.searchForInvitation());
  }

  async searchForInvitation() {
    const doc = await this.getInvitationLinkedToEmail(this.emailForm.value).toPromise();

    if (typeof doc === 'object') {
      this.showInvitationInput.emit(true);
      return this.organization.emit(doc);
    }
    else return this.showInvitationInput.emit(doc);
  }
}
