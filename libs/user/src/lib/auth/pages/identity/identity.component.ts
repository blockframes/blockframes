import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PasswordControl } from '@blockframes/utils/form/controls/password.control';
import { InvitationService } from '@blockframes/invitation/+state';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, getAppName } from '@blockframes/utils/apps';

@Component({
  selector: 'auth-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent implements OnInit {
  public creating = false;
  public appName: string;
  public form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl({ value: this.query.user.email, disabled: true }, Validators.email),
    generatedPassword: new FormControl('', Validators.required),
    newPassword: new PasswordControl(),
    termsOfUse: new FormControl(false, Validators.requiredTrue),
    privacyPolicy: new FormControl(false, Validators.requiredTrue),
  });

  public isTermsChecked: boolean;

  constructor(
    private service: AuthService,
    private query: AuthQuery,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private invitationService: InvitationService,
    private routerQuery: RouterQuery,
  ) { }

  public ngOnInit() {
    const app = getCurrentApp(this.routerQuery);
    this.appName = getAppName(app).label;
  }

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
      if (!!pendingInvitation) {
        // We put invitation to accepted only if the invitation.type is joinOrganization.
        // Otherwise, user will have to create or join an org before accepting the invitation (to attend event for example)
        await this.invitationService.update(pendingInvitation.id, { status: 'accepted' });
      }

      this.creating = false;
      this.router.navigate(['/c'], { relativeTo: this.route });
    } catch (error) {
      this.creating = false;
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
