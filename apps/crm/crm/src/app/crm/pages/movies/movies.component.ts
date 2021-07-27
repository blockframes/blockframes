import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { OrganizationService, orgName } from '@blockframes/organization/+state';
import { Router } from '@angular/router';
import { EventService, isScreening } from '@blockframes/event/+state';

@Component({
  selector: 'crm-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesComponent implements OnInit {
  public versionColumns = {
    'id': { value: 'Id', disableSort: true },
    'poster': { value: 'Poster', disableSort: true },
    'title.international': 'International title',
    'org': 'Organization',
    'app.catalog.status': 'Catalog Status',
    'app.festival.status': 'Festival Status',
    'app.financiers.status': 'Financiers Status',
    'screeningCount': 'Screening count'
  };

  public initialColumns: string[] = [
    'id',
    'poster',
    'title.international',
    'org',
    'app.catalog.status',
    'app.festival.status',
    'app.financiers.status',
    'screeningCount'
  ];
  public rows = [];
  public exporting = new BehaviorStore(false);

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    const movies = await this.movieService.getAllMovies();
    // movie.orgIds is an array but in the front-end we only display one
    const orgIds = movies.map(movie => movie.orgIds[0]);

    const [orgs, screenings] = await Promise.all([
      this.orgService.getValue(orgIds),
      this.eventService.getValue(ref => ref.where('type', '==', 'screening')).then(screenings => screenings.filter(isScreening))
    ])

    this.rows = movies.map(movie => {
      const org = orgs.find(o => o.id === movie.orgIds[0]);
      const screeningCount = screenings.filter(e => e.meta?.titleId === movie.id).length.toString();
      return { org, ...movie, screeningCount };
    })
    this.cdRef.markForCheck();
  }

  goToEdit(movie) {
    this.router.navigate([`/c/o/dashboard/crm/movie/${movie.id}`])
  }

  public filterPredicate(data, filter: string) {
    const columnsToFilter = [
      'id',
      'internalRef',
      'title.international',
      'org.denomination.full',
      'org.denomination.public'
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  public async exportTable() {
    try {
      this.exporting.value = true;

      const exportedRows = this.rows.map(m => ({
        'movie id': m.id,
        'title': m.title.international,
        'internal ref': m.internalRef ? m.internalRef : '--',
        'org': m.org ? orgName(m.org) : '--',
        'orgId': m.org ? m.org.id : '--',
        'catalog status': m.app.catalog.status,
        'catalog access': m.app.catalog.access ? 'yes' : 'no',
        'festival status': m.app.festival.status,
        'festival access': m.app.festival.access ? 'yes' : 'no',
        'financiers status': m.app.financiers.status,
        'financiers access': m.app.financiers.access ? 'yes' : 'no',
        'screeningCount': m.screeningCount,
      }));

      downloadCsvFromJson(exportedRows, 'movies-list');

      this.exporting.value = false;
    } catch (err) {
      this.exporting.value = false;
    }

  }
}
