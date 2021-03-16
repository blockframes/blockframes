import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { InvitationService } from "@blockframes/invitation/+state";
import { AlgoliaOrganization } from '@blockframes/utils/algolia';
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'auth-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailInputComponent implements OnInit {

  @Output() private readonly hasInvitation = new EventEmitter<AlgoliaOrganization | boolean>(false);

  @Input() emailForm: FormControl;

  constructor(private invitationService: InvitationService) { }

  ngOnInit() {
    if (!!this.emailForm.value) this.searchForInvitation();

    this.emailForm.valueChanges.pipe(debounceTime(500)).subscribe(_ => {
      if (this.emailForm.valid) this.searchForInvitation();
    });
  }

  async searchForInvitation() {
    const output = await this.invitationService.getInvitationLinkedToEmail(this.emailForm.value).toPromise<AlgoliaOrganization | boolean>();
    this.hasInvitation.emit(output);
  }
}
