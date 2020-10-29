import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { CampaignService, MovieCampaign } from '@blockframes/campaign/+state/campaign.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

type Filters = 'all' | 'draft' | 'ongoing' | 'achieved';

const columns = {
  title: 'Title',
  view: '# Views',
  directors: 'Director(s)',
  productionStatus: 'Production Status',
  'storeConfig.status': 'Status'
};

function filterMovieCampaign(movies: MovieCampaign[], filter: Filters) {
  switch (filter) {
    case 'all': return movies;
    case 'draft': return movies.filter(movie => movie.storeConfig.status === 'draft');
    case 'ongoing': return movies.filter(movie => movie.storeConfig.status === 'accepted' && movie.campaign?.cap > movie.campaign?.received);
    case 'achieved': return movies.filter(movie => movie.storeConfig.status === 'accepted' && movie.campaign?.cap === movie.campaign?.received);
  }
}

@Component({
  selector: 'financiers-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
  columns = columns;
  initialColumns = ['title', 'view', 'directors', 'productionStatus', 'storeConfig.status'];
  titles$: Observable<MovieCampaign[]>;
  filter = new FormControl('all');
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  private sub: Subscription;

  constructor(
    private movieService: MovieService,
    private campaignService: CampaignService,
    private orgQuery: OrganizationQuery,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    // Sync with anaytics: It's ok to give ALL movieIds they'll just be set to 0
    this.sub = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.syncWithAnalytics(org.movieIds)),
    ).subscribe();

    this.titles$ = this.orgQuery.selectActive().pipe(
      switchMap(org => this.campaignService.queryMoviesCampaign(org.movieIds)),
      map(movies => movies.filter(movie => !!movie)),
      map(movies => movies.filter(movie => movie.storeConfig.appAccess.financiers)),
      switchMap(movies => {
        return this.filter$.pipe(map(filter => filterMovieCampaign(movies, filter)))
      }),
      tap(movies => {
        !!movies.length ?
          this.dynTitle.setPageTitle('My titles') :
          this.dynTitle.setPageTitle('My titles', 'Empty');
      })
    );
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }

  public applyFilter(filter: Filters) {
    this.filter.setValue(filter);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

