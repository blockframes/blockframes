import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { Router } from '@angular/router';
import { EventService, isScreening } from '@blockframes/event/+state';
import { map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

interface CrmMovie extends Movie {
  org: Organization;
  screeningCount: number;
}

@Component({
  selector: 'crm-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesComponent implements OnInit {
  public movies$?: Observable<CrmMovie[]>;
  public exporting = false;

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    this.movies$ = combineLatest([
      this.movieService.valueChanges(),
      this.orgService.valueChanges(),
      this.eventService.valueChanges(ref => ref.where('type', '==', 'screening'))),
    ]).pipe(
        map(([movies, orgs, events]) => {
          const screenings = events.filter(isScreening);
          return movies.map(movie => {
            const org = orgs.find(o => o.id === movie.orgIds[0]);
            const screeningCount = screenings.filter(e => e.meta?.titleId === movie.id).length;
            return { ...movie, org, screeningCount } as CrmMovie;
          })
        }),
      )
  }

  goToEditNewTab(id: string, $event: Event) {
    $event.stopPropagation()
    const urlTree = this.router.createUrlTree([`c/o/dashboard/crm/movie/${id}`])
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank', 'noreferrer');
  }

  goToEdit(movie: Movie) {
    this.router.navigate([`/c/o/dashboard/crm/movie/${movie.id}`])
  }

  public exportTable(movies: CrmMovie[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const exportedRows = movies.map(m => ({
        'movie id': m.id,
        'title': m.title.international,
        'internal ref': m.internalRef ?? '--',
        'org': m.org ? orgName(m.org) : '--',
        'orgId': m.org?.id ?? '--',
        'catalog status': m.app.catalog.status,
        'catalog access': m.app.catalog.access ? 'yes' : 'no',
        'festival status': m.app.festival.status,
        'festival access': m.app.festival.access ? 'yes' : 'no',
        'financiers status': m.app.financiers.status,
        'financiers access': m.app.financiers.access ? 'yes' : 'no',
        'screeningCount': `${m.screeningCount}`,
      }));

      downloadCsvFromJson(exportedRows, 'movies-list');

      this.exporting = false;
    } catch (err) {
      this.exporting = false;
    }
    this.cdr.markForCheck();

  }
}
