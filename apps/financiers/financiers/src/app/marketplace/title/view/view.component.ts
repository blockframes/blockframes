import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CollectionReference } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService, OrganizationQuery, orgName as getOrgName } from '@blockframes/organization/+state';
import { Campaign, CampaignService } from '@blockframes/campaign/+state';
import { RouteDescription } from '@blockframes/utils/common-interfaces';
import { SendgridService } from '@blockframes/utils/emails/sendgrid.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { shareReplay, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthQuery } from '@blockframes/auth/+state';
import { UserService } from '@blockframes/user/+state';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export class MarketplaceMovieViewComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  private dialogRef: MatDialogRef<any, any>;
  public movie$: Observable<Movie>;
  public orgs$: Observable<Organization[]>;
  public campaign$: Observable<Campaign>;
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

  // @TODO #5350 Now we can upload video, clean old links
  promoLinks = [
    'promo_reel_link',
    'scenario',
    'screener_link',
    'teaser_link',
    'presentation_deck',
    'trailer_link'
  ];

  constructor(
    private movieQuery: MovieQuery,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
    private userService: UserService,
    private campaignService: CampaignService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private sendgrid: SendgridService,
    public router: Router
  ) { }

  ngOnInit() {

    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.movieQuery.selectActive().pipe(
      switchMap(movie => this.orgService.valueChanges(movie.orgIds)),
      shareReplay(1)
    );
    this.campaign$ = this.movieQuery.selectActiveId().pipe(
      switchMap(id => this.campaignService.valueChanges(id)),
      tap(campaign => this.currency = campaign.currency)
    );
  }

  openForm(orgs: Organization[]) {
    const form = new FormGroup({
      subject: new FormControl('', Validators.required),
      from: new FormControl(),
      to: new FormControl(),
      message: new FormControl(),
    });
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      data: { orgs, form }
    });
  }

  async sendEmail(emailData: EmailData, title: string, orgs: Organization[]) {
    this.dialogRef.close();
    const templateId = 'd-e902521de8684c57bbfa633bad88567a';
    const { firstName, lastName, email } = this.authQuery.user;
    const orgName = getOrgName(this.orgQuery.getActive());
    const promises: Promise<ErrorResultResponse>[] = [];

    for (const org of orgs) {
      const users = await this.userService.getValue(org.userIds);
      for (const user of users) {
        const data = {
          ...emailData,
          currency: getCurrencySymbol(this.currency, 'wide'),
          investor: { firstName, lastName, email, orgName },
          user: { firstName: user.firstName },
          title,
        };

        const promise = this.sendgrid.sendWithTemplate({
          request: { templateId, data, to: user.email },
          app: 'financiers'
        });
        promises.push(promise);
      }
    }
    const res = await Promise.all(promises);
    const success = res.some(r => r.result);
    const message = success
      ? 'Your email has been sent.'
      : 'An error occurred. Your email was not sent.';
    this.snackbar.open(message, null, { duration: 3000 });
  }
}
