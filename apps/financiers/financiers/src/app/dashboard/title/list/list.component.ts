import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Movie } from '@blockframes/movie/+state';
import { CampaignService, MovieCampaign } from '@blockframes/campaign/+state/campaign.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

type Filters = 'all' | 'draft' | 'ongoing' | 'achieved';

const columns = {
  title: 'Title',
  productionStatus: 'Production Status',
  'campaign.cap': 'Goal Funding',
  'campaign.received': 'Funding Raised',
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
export class ListComponent implements OnInit {
  columns = columns;
  initialColumns = ['title', 'productionStatus', 'campaign.cap', 'campaign.received'];
  titles$: Observable<MovieCampaign[]>;
  filter = new FormControl('all');
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  constructor(
    private campaignService: CampaignService,
    private orgQuery: OrganizationQuery,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
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
}

