import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/service';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { Invitation, RightholderRole } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia/helper.utils';
import { BehaviorSubject } from 'rxjs';
import { OrganizationService } from '@blockframes/organization/service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';

@Component({
  selector: 'waterfall-right-holder-add',
  templateUrl: './right-holder-add.component.html',
  styleUrls: ['./right-holder-add.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightHolderAddComponent implements OnInit {

  public form = new FormEntity({
    users: createAlgoliaUserForm([Validators.maxLength(50), Validators.required]),
    roles: new UntypedFormControl('', Validators.required)
  });

  private _isSending = new BehaviorSubject(false);
  public isSending$ = this._isSending.asObservable();

  public isProducer = false;

  public separators = [ENTER, COMMA, SEMICOLON];

  @Input() invitations: Invitation[] = [];
  @Input() waterfallId: string;

  constructor(
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private organizationService: OrganizationService,
    private permissionsService: WaterfallPermissionsService,
  ) { }

  async ngOnInit() {
    this.isProducer = await this.permissionsService.hasRole(this.waterfallId, this.organizationService.org.id, 'producer');
    if (!this.isProducer) this.form.get('roles').setValue(['producer']);
  }

  async invite() {
    if (this.form.valid) {
      try {
        const unique: string[] = Array.from(new Set(this.form.get('users').value.map(guest => guest.email.trim().toLowerCase())));
        const roles: RightholderRole[] = this.form.get('roles').value;

        // Retreive emails that are not already invited 
        const isInvited = (inv, email) => inv.toUser?.email === email && inv.mode === 'invitation';
        const emails = unique.filter(email => !this.invitations.some(inv => isInvited(inv, email)));

        this.form.reset([]);
        this._isSending.next(true);

        const fromOrg = this.organizationService.org;

        // Send invitation to emails
        if (emails.length) {
          await this.invitationService.invite(emails, fromOrg).to('joinWaterfall', this.waterfallId, { roles });
        } else {
          this.snackBar.open('All selected emails are already invited', 'close', { duration: 5000 });
        }

        this._isSending.next(false);
      } catch (error) {
        this._isSending.next(false);
        this.snackBar.open(error.message, 'close', { duration: 5000 });
      }
    }
  }

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
}

