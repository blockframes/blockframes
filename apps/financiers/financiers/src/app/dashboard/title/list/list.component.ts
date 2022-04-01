import { Component, ChangeDetectionStrategy, OnInit, Optional, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { Movie } from '@blockframes/shared/model';
import { CampaignService, MovieCampaign } from '@blockframes/campaign/+state/campaign.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';

type Filters = 'all' | 'draft' | 'ongoing' | 'achieved' | 'archived';

function filterMovieCampaign(movies: MovieCampaign[], filter: Filters) {
  switch (filter) {
    case 'all':
      return movies.filter(movie => movie.app.financiers.status !== 'archived');
    case 'draft':
      return movies.filter(movie => movie.app.financiers.status === 'draft');
    case 'ongoing':
      return movies.filter(movie => movie.app.financiers.status === 'accepted' && movie.campaign?.cap > movie.campaign?.received);
    case 'achieved':
      return movies.filter(
        movie => movie.app.financiers.status === 'accepted' && movie.campaign?.cap === movie.campaign?.received
      );
    case 'archived':
      return movies.filter(movie => movie.app.financiers.status === 'archived');
  }
}

@Component({
  selector: 'financiers-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit {
  titles$: Observable<MovieCampaign[]>;
  titleCount$: Observable<Record<string, number>>;
  filter = new FormControl('all');
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  constructor(
    private campaignService: CampaignService,
    private orgService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private movieService: MovieService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) {}

  ngOnInit() {
    this.titles$ = this.orgService.currentOrg$.pipe(
      switchMap(org => this.movieService.valueChanges(fromOrg(org.id)).pipe(map(movies => movies.map(m => m.id)))),
      switchMap(movieIds => this.campaignService.queryMoviesCampaign(movieIds)),
      map(movies => movies.filter(movie => movie.app.financiers.access)),
      switchMap(movies => this.filter$.pipe(map(filter => filterMovieCampaign(movies, filter)))),
      tap(movies => {
        movies.length ? this.dynTitle.setPageTitle('My titles') : this.dynTitle.setPageTitle('My titles', 'Empty');
      })
    );

    this.titleCount$ = this.orgService.currentOrg$.pipe(
      switchMap(org => this.movieService.valueChanges(fromOrg(org.id)).pipe(map(movies => movies.map(m => m.id)))),
      switchMap(movieIds => this.campaignService.queryMoviesCampaign(movieIds)),
      map(movies => movies.filter(movie => movie.app.financiers.access)),
      map(m => ({
        all: m.length,
        draft: m.filter(m => m.app.financiers.status === 'draft').length,
        ongoing: m.filter(m => m.app.financiers.status === 'submitted' && m.campaign?.cap > m.campaign?.received).length,
        achieved: m.filter(m => m.app.financiers.status === 'accepted' && m.campaign?.cap === m.campaign?.received).length,
        archived: m.filter(m => m.app.financiers.status === 'archived').length,
      }))
    );
  }

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }

  public applyFilter(filter: Filters) {
    this.filter.setValue(filter);
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
