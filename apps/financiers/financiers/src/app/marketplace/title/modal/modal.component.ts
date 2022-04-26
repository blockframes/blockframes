import { getCurrencySymbol } from '@angular/common';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state';
import { Campaign, Movie, MovieCurrency, Organization } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';
import { UserService } from '@blockframes/user/+state';
import { supportMailosaur } from '@blockframes/utils/constants';
import { templateIds } from '@blockframes/utils/emails/ids';
import { SendgridService } from '@blockframes/utils/emails/sendgrid.service';
import { getUserEmailData, OrgEmailData } from '@blockframes/utils/emails/utils';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { Observable } from 'rxjs';

interface EmailData {
  subject: string;
  from: string;
  to: string;
  message: string;
}

interface Data {
  form: FormData;
  orgs: Organization[];
  movie: Movie;
  campaign: Observable<Campaign>;
  currency: MovieCurrency;
  onSend: (emailData: EmailData, title: string, orgs: Organization[]) => void;
  closeModal: () => void
}

@Component({
  selector: 'financiers-movie-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieModalComponent {
  
  public sending = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<MarketplaceMovieModalComponent>,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private sendgrid: SendgridService,
    private orgService: OrganizationService
  ) { }

  async sendEmail (emailData: EmailData, title: string, orgs: Organization[]) {
    try {
      this.sending = true;
      const templateId = templateIds.financiers.invest;
      const userSubject = getUserEmailData(this.authService.profile);

      const org = this.orgService.org;
      const orgUserSubject: OrgEmailData = {
        denomination: org.denomination.full ?? org.denomination.public,
        id: org.id || '',
        email: org.email || ''
      }

      const promises: Promise<ErrorResultResponse>[] = [];

      const cyCheck = 'Cypress' in window;
      let emailReady = false;
      let numEmails = 0;

      for (const org of orgs) {
        const users = await this.userService.getValue(org.userIds);
        for (const user of users) {
          let toUser = getUserEmailData(user);
          const userEmail = toUser.email;
          // For e2e test purpose
          if (cyCheck) {
            toUser = { ...toUser, email: supportMailosaur };
          }

          const data = {
            ...emailData,
            currency: getCurrencySymbol(this.data.currency, 'wide'),
            userSubject,
            user: toUser,
            org: orgUserSubject,
            title,
          };

          /*
            * If running E2E, for user other than sender,
            * store it for access in E2E test.
            * A single email is sufficient to check the email template
            */
          if (cyCheck && (userEmail !== userSubject.email)) {
            emailReady = true;
            ++numEmails;
            window['cyEmailData'] = data;
          }

          const promise = this.sendgrid.sendWithTemplate({
            request: { templateId, data, to: toUser.email },
            app: 'financiers'
          });
          promises.push(promise);
        }
      }

      if (cyCheck && emailReady) {
        window['cyEmailData'].numEmails = numEmails;
      }
      const res = await Promise.all(promises);
      const success = res.some(r => r.result);
      if (success) {
        this.data.closeModal();
        this.snackBar.open('Your email has been sent.', null, { duration: 3000 });
      } else {
        throw new Error('An error occured');
        }
    } catch (err) {
      console.log(err)
      this.sending = false;
      this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
    }
  }
}