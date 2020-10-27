import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { Campaign, CampaignService } from '@blockframes/campaign/+state';
import { mainRoute, additionalRoute, artisticRoute, productionRoute } from '@blockframes/movie/marketplace';
import { RouteDescription } from '@blockframes/utils/common-interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface EmailTemplate {
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

  public navLinks: RouteDescription[] = [
    mainRoute,
    artisticRoute,
    {
      ...productionRoute,
      label: 'Production Environment'
    },
    additionalRoute,
    {
      path: 'financing',
      label: 'Financial Elements'
    },
    {
      path: 'investment',
      label: 'Investment Campaign'
    }
  ];

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
    private orgService: OrganizationService,
    private campaignService: CampaignService,
    private dialog: MatDialog,
    public router: Router
  ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.movieQuery.selectActiveId().pipe(
      switchMap(movieId => this.orgService.getValue(ref => ref.where('movieIds', 'array-contains', movieId)))
    );
    this.campaign$ = this.movieQuery.selectActiveId().pipe(
      switchMap(id => this.campaignService.valueChanges(id))
    );
  }

  openForm() {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      data: new FormGroup({
        subject: new FormControl('', Validators.required),
        from: new FormControl(0),
        to: new FormControl(0),
        message: new FormControl(),
      })
    });
  }

  sendEmail(email: EmailTemplate, movie: Movie) {
    this.dialogRef.close();
  }
}
