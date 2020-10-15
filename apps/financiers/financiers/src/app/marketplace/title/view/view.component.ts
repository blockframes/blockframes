import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
import { OrganizationQuery } from '@blockframes/organization/+state';

@Component({
  selector: 'financiers-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit {
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
      path: 'finance',
      label: 'Financing Conditions'
    },
    {
      path: 'campaign',
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
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
    private campaignService: CampaignService,
    public router: Router
  ) {}

  ngOnInit() {
    const orgId = this.orgQuery.getActiveId();
    this.movie$ = this.movieQuery.selectActive();
    this.orgs$ = this.movieQuery.selectActiveId().pipe(
      switchMap(movieId => this.orgService.getValue(ref => ref.where('movieIds', 'array-contains', movieId)))
    );
    this.campaign$ = this.movieQuery.selectActiveId().pipe(
      switchMap(id => this.campaignService.valueChanges(id, { params: { orgId }}))
    );
  }
}
