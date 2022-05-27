import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { fromOrg, MovieService } from '@blockframes/movie/service';
import { App, MovieCampaign } from '@blockframes/model';
import { CampaignService } from '@blockframes/campaign/service';
import { OrganizationService } from '@blockframes/organization/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';
import { filters } from '@blockframes/ui/list/table/filters';
import { MatSnackBar } from '@angular/material/snack-bar';

type Filters = 'all' | 'draft' | 'ongoing' | 'achieved' | 'archived';

function filterMovieCampaign(movies: MovieCampaign[], filter: Filters) {
  switch (filter) {
    case 'all':
      return movies.filter((movie) => movie.app.financiers.status !== 'archived');
    case 'draft':
      return movies.filter((movie) => movie.app.financiers.status === 'draft');
    case 'ongoing':
      return movies.filter(
        (movie) =>
          movie.app.financiers.status === 'accepted' &&
          movie.campaign?.cap > movie.campaign?.received
      );
    case 'achieved':
      return movies.filter(
        (movie) =>
          movie.app.financiers.status === 'accepted' &&
          movie.campaign?.cap === movie.campaign?.received
      );
    case 'archived':
      return movies.filter((movie) => movie.app.financiers.status === 'archived');
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
  filters = filters;

  constructor(
    private campaignService: CampaignService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private snackbar: MatSnackBar,
    private movieService: MovieService,
    @Inject(APP) public app: App
  ) { }

  ngOnInit() {
    this.titles$ = this.orgService.currentOrg$.pipe(
      switchMap((org) =>
        this.movieService
          .valueChanges(fromOrg(org.id))
          .pipe(map((movies) => movies.map((m) => m.id)))
      ),
      switchMap((movieIds) => this.campaignService.queryMoviesCampaign(movieIds)),
      map((movies) => movies.filter((movie) => movie.app.financiers.access)),
      switchMap((movies) =>
        this.filter$.pipe(map((filter) => filterMovieCampaign(movies, filter)))
      ),
      tap((movies) => {
        movies.length
          ? this.dynTitle.setPageTitle('My titles')
          : this.dynTitle.setPageTitle('My titles', 'Empty');
      })
    );

    this.titleCount$ = this.orgService.currentOrg$.pipe(
      switchMap((org) =>
        this.movieService
          .valueChanges(fromOrg(org.id))
          .pipe(map((movies) => movies.map((m) => m.id)))
      ),
      switchMap((movieIds) => this.campaignService.queryMoviesCampaign(movieIds)),
      map((movies) => movies.filter((movie) => movie.app.financiers.access)),
      map((m) => ({
        all: m.length,
        draft: m.filter((m) => m.app.financiers.status === 'draft').length,
        ongoing: m.filter(
          (m) => m.app.financiers.status === 'submitted' && m.campaign?.cap > m.campaign?.received
        ).length,
        achieved: m.filter(
          (m) => m.app.financiers.status === 'accepted' && m.campaign?.cap === m.campaign?.received
        ).length,
        archived: m.filter((m) => m.app.financiers.status === 'archived').length,
      }))
    );
  }

  public applyFilter(filter: Filters) {
    this.filter.setValue(filter);
  }
}
