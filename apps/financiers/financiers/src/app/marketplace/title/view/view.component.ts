import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state';
import { CampaignService } from '@blockframes/campaign/+state';
import { RouteDescription } from '@blockframes/utils/common-interfaces';
import { SendgridService } from '@blockframes/utils/emails/sendgrid.service';
import { templateIds } from '@blockframes/utils/emails/ids';
import { MatDialog } from '@angular/material/dialog';
import { pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state';
import { UserService } from '@blockframes/user/+state';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getUserEmailData, OrgEmailData } from '@blockframes/utils/emails/utils';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { supportMailosaur } from 'libs/testing/e2e/src';

interface EmailData {
  subject: string;
  from: string;
  to: string;
  message: string;
}

@Component({
  selector: 'financiers-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<unknown>;

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.getValue(movieId))
  );

  public orgs$ = this.movie$.pipe(
    switchMap(movie => this.orgService.valueChanges(movie.orgIds)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  public campaign$ = this.movie$.pipe(
    switchMap(movie => this.campaignService.valueChanges(movie.id)),
    tap(campaign => this.currency = campaign.currency)
  );

  public currency: string;

  public navLinks: RouteDescription[] = [
    mainRoute,
    artisticRoute,
    {
      ...productionRoute,
      label: 'Production'
    },
    additionalRoute,
    {
      path: 'financing',
      label: 'Financial'
    },
    {
      path: 'investment',
      label: 'Investment'
    }
  ];

  promoLinks = [
    'scenario',
    'presentation_deck',
  ];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService,
    private orgService: OrganizationService,
    private userService: UserService,
    private campaignService: CampaignService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private sendgrid: SendgridService,
    public router: Router
  ) { }

  openForm(orgs: Organization[]) {
    const form = new FormGroup({
      subject: new FormControl('', Validators.required),
      scope: new FormGroup({
        from: new FormControl(),
        to: new FormControl()
      }),
      message: new FormControl(),
    });
    this.dialog.open(this.dialogTemplate, {
      data: { orgs, form }
    });
  }

  async sendEmail(emailData: EmailData, title: string, orgs: Organization[]) {
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
    const message = success
      ? 'Your email has been sent.'
      : 'An error occurred. Your email was not sent.';
    this.snackbar.open(message, null, { duration: 3000 });
  }
}
