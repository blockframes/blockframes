import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/service';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { Invitation, Waterfall } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form';
import { createAlgoliaUserForm } from '@blockframes/utils/algolia/helper.utils';
import { BehaviorSubject } from 'rxjs';
import { OrganizationService } from '@blockframes/organization/service';
import { UserService } from '@blockframes/user/service';
import { where } from 'firebase/firestore';

@Component({
  selector: 'waterfall-organization-invite',
  templateUrl: './organization-invite.component.html',
  styleUrls: ['./organization-invite.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationInviteComponent {

  public form = new FormEntity({
    users: createAlgoliaUserForm([Validators.maxLength(50), Validators.required]),
    rightholderId: new FormControl<string>('', Validators.required),
    isAdmin: new FormControl<boolean>(false)
  });

  private _isSending = new BehaviorSubject(false);
  public isSending$ = this._isSending.asObservable();

  public isProducer = false;

  public separators = [ENTER, COMMA, SEMICOLON];

  @Input() invitations: Invitation[] = [];
  @Input() waterfall: Waterfall;

  constructor(
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private organizationService: OrganizationService,
    private userService: UserService,
  ) { }

  async invite() {
    if (this.form.valid) {
      try {
        const unique: string[] = Array.from(new Set(this.form.get('users').value.map(guest => guest.email.trim().toLowerCase())));

        // Retreive emails that are not already invited 
        const isInvited = (inv, email) => inv.toUser?.email === email && inv.mode === 'invitation';
        const _emails = unique.filter(email => !this.invitations.some(inv => isInvited(inv, email)));

        // Check if invited users are not already part of the waterfall 
        const promises = _emails.map(async email => {
          const [user] = await this.userService.getValue([where('email', '==', email)]);
          if (!user?.orgId || !this.waterfall.orgIds.includes(user.orgId)) return email;
        });

        const emails = (await Promise.all(promises)).filter(e => !!e);

        const rightholderIds = [this.form.get('rightholderId').value];
        const isAdmin = this.form.get('isAdmin').value

        this.form.reset();
        this._isSending.next(true);

        const fromOrg = this.organizationService.org;

        // Send invitation to emails
        if (emails.length) {
          await this.invitationService.invite(emails, fromOrg).to('joinWaterfall', this.waterfall.id, { rightholderIds, isAdmin });
        } else {
          this.snackBar.open('All selected emails are already on the Waterfall or invited to it.', 'close', { duration: 5000 });
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

