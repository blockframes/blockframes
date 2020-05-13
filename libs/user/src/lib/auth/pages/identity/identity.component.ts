import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PasswordControl } from '@blockframes/utils/form/controls/password.control';
import { AngularFirestore } from '@angular/fire/firestore';
import { InvitationService } from '@blockframes/invitation/+state';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'auth-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent {
  public creating = false;
  public form = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl({ value: this.query.user.email, disabled: true }, Validators.email),
    generatedPassword: new FormControl(''),
    newPassword: new PasswordControl()
  });

  public isTermsChecked: boolean;

  constructor(
    private service: AuthService,
    private db: AngularFirestore,
    private query: AuthQuery,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private invitationService: InvitationService,
  ) { }

  public async update() {
    if (this.form.invalid) {
      this.snackBar.open('Please enter valid name and surname', 'close', { duration: 2000 });
      return;
    }
    try {
      this.creating = true;
      await this.service.updatePassword(
        this.form.get('generatedPassword').value,
        this.form.get('newPassword').value
      );
      await this.service.update({
        firstName: this.form.get('firstName').value,
        lastName: this.form.get('lastName').value,
      });

      // Accept the invitation from the organization.
      const invitations = await this.invitationService.getValue(ref => ref.where('mode', '==', 'invitation')
        .where('type', '==', 'joinOrganization')
        .where('toUser.uid', '==', this.query.userId));
      const pendingInvitation = invitations.find(invitation => invitation.status === 'pending');
      await this.db.doc(`invitations/${pendingInvitation.id}`).update({ status: 'accepted' });
      this.creating = false;
      this.router.navigate(['/c'], { relativeTo: this.route });
    } catch (error) {
      this.creating = false;
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  /** Check the value of the boolean outputed by TermsAndConditionsComponent */
  public checkTermsOfUse(checked: boolean) {
    this.isTermsChecked = checked;
  }
}
