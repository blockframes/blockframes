import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { InvitationService } from "@blockframes/invitation/+state";
import { AlgoliaOrganization } from '@blockframes/utils/algolia';

@Component({
  selector: 'auth-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailInputComponent implements OnInit {

  @Output() private readonly organization = new EventEmitter<AlgoliaOrganization>();
  @Output() showInvitationInput = new EventEmitter<boolean>(false);
  @Input() emailForm: FormControl;

  constructor(private invitationService: InvitationService) { }

  ngOnInit() {
    this.emailForm.valueChanges.subscribe(_ => {
      if (this.emailForm.valid) this.searchForInvitation();
    });
  }

  async searchForInvitation() {
    const doc = await this.invitationService.getInvitationLinkedToAnEmail(this.emailForm.value);

    if (typeof doc === 'object') {
      this.showInvitationInput.emit(true);
      return this.organization.emit(doc);
    }
    else return this.showInvitationInput.emit(doc);
  }
}
