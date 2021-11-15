import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { BehaviorStore } from '@blockframes/utils/observable-helpers';
import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { Router } from '@angular/router';
import { EventService, isScreening } from '@blockframes/event/+state';
import { take, map } from 'rxjs/operators';
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
  public exporting = new BehaviorStore(false);

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.movies$ = combineLatest([
      this.movieService.valueChanges().pipe(take(2)),
      this.orgService.valueChanges().pipe(take(2)),
      this.eventService.valueChanges(ref => ref.where('type', '==', 'screening')).pipe(take(2)),
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
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`c/o/dashboard/crm/movie/${id}`])
    );
    window.open(url, '_blank', 'noreferrer');
  }

  goToEdit(movie: Movie) {
    this.router.navigate([`/c/o/dashboard/crm/movie/${movie.id}`])
  }

  public exportTable(movies: CrmMovie[]) {
    try {
      this.exporting.value = true;

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

      this.exporting.value = false;
    } catch (err) {
      this.exporting.value = false;
    }

  }
}
