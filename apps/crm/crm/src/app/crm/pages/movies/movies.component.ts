import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '@blockframes/movie/service';
import { downloadCsvFromJson, unique } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/service';
import { EventService } from '@blockframes/event/service';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { filters } from '@blockframes/ui/list/table/filters';
import { ContractService } from '@blockframes/contract/contract/service';
import { AnalyticsService } from '@blockframes/analytics/service';
import { UserService } from '@blockframes/user/service';
import { map, tap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { where } from 'firebase/firestore';
import {
  isScreening,
  CrmMovie,
  Analytics,
  isMandate,
  Organization,
  filterOwnerEvents,
  crmMoviesToExport,
  moviesToCrmMovies,
  movieAnalyticsToExport,
} from '@blockframes/model';

@Component({
  selector: 'crm-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesComponent implements OnInit {
  public movies$?: Observable<CrmMovie[]>;
  public exporting = false;
  public exportingAnalytics = false;
  public sorts = sorts;
  public filters = filters;
  private orgs: Organization[] = [];

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private contractService: ContractService,
    private analyticsService: AnalyticsService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.movies$ = combineLatest([
      this.movieService.valueChanges(),
      this.orgService.valueChanges(),
      this.eventService.valueChanges([where('type', '==', 'screening')]),
      this.contractService.valueChanges([where('type', '==', 'mandate')])
    ]).pipe(
      tap(([_, orgs]) => this.orgs = orgs),
      map(([movies, orgs, events, _mandates]) => {
        const screenings = events.filter(isScreening);
        const mandates = _mandates.filter(isMandate);
        return moviesToCrmMovies(movies, orgs, screenings, mandates);
      })
    );
  }

  goToEdit(movie: CrmMovie) {
    this.router.navigate([`/c/o/dashboard/crm/movie/${movie.id}`]);
  }

  public exportTable(movies: CrmMovie[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const rows = crmMoviesToExport(movies, 'csv');

      downloadCsvFromJson(rows, 'movies-list');

      this.exporting = false;
    } catch (err) {
      this.exporting = false;
    }
    this.cdr.markForCheck();
  }

  public async exportTitleAnalytics(titles: CrmMovie[]) {
    this.exportingAnalytics = true;
    this.cdr.markForCheck();

    const titleQuery = [where('type', '==', 'title')];
    const titleAnalytics = await this.analyticsService.load<Analytics<'title'>>(titleQuery);

    const availsSearchQuery = [where('type', '==', 'titleSearch'), where('name', 'in', ['filteredAvailsCalendar', 'filteredAvailsMap'])];
    const availsSearchAnalytics = await this.analyticsService.load<Analytics<'titleSearch'>>(availsSearchQuery);

    const allAnalytics = filterOwnerEvents([...titleAnalytics, ...availsSearchAnalytics]);

    const allUids = unique(allAnalytics.map(analytic => analytic.meta.uid));
    const allUsers = await this.userService.load(allUids);

    const rows = movieAnalyticsToExport(titles, allAnalytics, allUids, allUsers, this.orgs, 'csv');

    downloadCsvFromJson(rows, 'movies-analytics-list');

    this.exportingAnalytics = false;
    this.cdr.markForCheck();
  }
}
