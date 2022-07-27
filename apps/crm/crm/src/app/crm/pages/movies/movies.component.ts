import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Movie, isScreening, CrmMovie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/service';
import { EventService } from '@blockframes/event/service';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { filters } from '@blockframes/ui/list/table/filters';

import { map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

import { where } from 'firebase/firestore';
import { format } from 'date-fns';
import { joinWith } from 'ngfire';
import { ContractService } from '@blockframes/contract/contract/service';

const titleMandateQuery = (id: string) => ([
  where('titleId', '==', id),
  where('type', '==', 'mandate')
]);

@Component({
  selector: 'crm-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesComponent implements OnInit {
  public movies$?: Observable<CrmMovie[]>;
  public exporting = false;
  public sorts = sorts;
  public filters = filters;

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private contractService: ContractService,
  ) { }

  async ngOnInit() {
    this.movies$ = combineLatest([
      this.movieService.valueChanges(),
      this.orgService.valueChanges(),
      this.eventService.valueChanges([where('type', '==', 'screening')]),
    ]).pipe(
      map(([movies, orgs, events]) => {
        const screenings = events.filter(isScreening);
        return movies.map((movie) => {
          const org = orgs.find((o) => o.id === movie.orgIds[0]);
          const screeningCount = screenings.filter((e) => e.meta?.titleId === movie.id).length;
          const releaseMedias = movie.originalRelease.map(release => release.media)
          return { ...movie, releaseMedias, org, screeningCount } as CrmMovie;
        });
      }),
      joinWith({
        mandate: movie => this.contractService.valueChanges(titleMandateQuery(movie.id))
      })
    );
  }

  goToEditNewTab(id: string, $event: Event) {
    $event.stopPropagation();
    const urlTree = this.router.createUrlTree([`c/o/dashboard/crm/movie/${id}`]);
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank', 'noreferrer');
  }

  goToEdit(movie: Movie) {
    this.router.navigate([`/c/o/dashboard/crm/movie/${movie.id}`]);
  }

  public exportTable(movies: CrmMovie[]) {
    try {
      this.exporting = true;
      this.cdr.markForCheck();

      const exportedRows = movies.map((m) => ({
        'movie id': m.id,
        title: m.title.international,
        'internal ref': m.internalRef ?? '--',
        org: m.org.name || '--',
        orgId: m.org?.id ?? '--',
        'catalog status': m.app.catalog.status,
        'catalog access': m.app.catalog.access ? 'yes' : 'no',
        'festival status': m.app.festival.status,
        'festival access': m.app.festival.access ? 'yes' : 'no',
        'financiers status': m.app.financiers.status,
        'financiers access': m.app.financiers.access ? 'yes' : 'no',
        'screeningCount': m.screeningCount,
        'creation date': format(m._meta.createdAt, 'MM/dd/yyyy'),
        'last modification date': m._meta.updatedAt ? format(m._meta.updatedAt, 'MM/dd/yyyy') : '--'
      }));

      downloadCsvFromJson(exportedRows, 'movies-list');

      this.exporting = false;
    } catch (err) {
      this.exporting = false;
    }
    this.cdr.markForCheck();
  }
}
