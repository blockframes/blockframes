import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import { AuthQuery } from '@blockframes/auth/+state';
import { AngularFireFunctions } from '@angular/fire/functions';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: '[form] auth-form-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent {
  public uid = this.authQuery.userId;
  public emailSent = false;

  @Input() form: ProfileForm;

  constructor(
    public authQuery: AuthQuery,
    private cdr: ChangeDetectorRef,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery
  ) {}
  
  async sendEmailVerification() {
    const { email, firstName } = this.authQuery.user;
    const app = getCurrentApp(this.routerQuery);
    
    const sendVerifyEmail = this.functions.httpsCallable('sendVerifyEmailAddress');
    await sendVerifyEmail({ email, firstName, app }).toPromise();
    this.emailSent = true;
    this.cdr.markForCheck();
  }
}
