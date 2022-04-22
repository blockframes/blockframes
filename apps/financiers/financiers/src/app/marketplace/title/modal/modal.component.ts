import { getCurrencySymbol } from '@angular/common';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { CampaignService } from '@blockframes/campaign/+state';
import { Campaign, Movie, MovieCurrency, Organization } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';
import { UserService } from '@blockframes/user/+state';
import { supportMailosaur } from '@blockframes/utils/constants';
import { templateIds } from '@blockframes/utils/emails/ids';
import { SendgridService } from '@blockframes/utils/emails/sendgrid.service';
import { getUserEmailData, OrgEmailData } from '@blockframes/utils/emails/utils';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { Observable, pluck, switchMap, tap } from 'rxjs';

interface Data {
  orgs: Organization[];
  form: FormGroup;
}

interface EmailData {
  subject: string;
  from: string;
  to: string;
  message: string;
}

@Component({
  selector: 'financiers-movie-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieModalComponent {

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.getValue(movieId))
  );

  public campaign$ = this.movie$.pipe(
    switchMap(movie => this.campaignService.valueChanges(movie.id))
  );
  
  public currency: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Data,
    public dialogRef: MatDialogRef<MarketplaceMovieModalComponent>,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService,
    private campaignService: CampaignService,
    private orgService: OrganizationService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private sendgrid: SendgridService
  ) { }

  async sendEmail(emailData: EmailData, title: string, orgs: Organization[]) {
    try {
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
            currency: getCurrencySymbol(this.currency, 'wide'),
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
        this.snackBar.open('Your email has been sent.', null, { duration: 3000 });
      } else {
        throw new Error('An error occured');
       }
    } catch (err) {
      this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
    }
  }

  console(any: any) {
    console.log(any);
  }

}