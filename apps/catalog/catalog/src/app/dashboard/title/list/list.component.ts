import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Movie, StoreStatus, storeStatus } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { displayName } from '@blockframes/utils/utils';
import { CellModalComponent } from '@blockframes/ui/cell-modal/cell-modal.component';

@Component({
  selector: 'catalog-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleListComponent {
  filter = new FormControl();
  filter$: Observable<StoreStatus | ''> = this.filter.valueChanges.pipe(
    startWith(this.filter.value || '')
  );

  movies$ = this.service.queryDashboard(this.app).pipe(
    map(titles => titles.map(title => {
      title.analytics = title.analytics.filter(analytic => analytic.name === 'pageView');
      return title;
    })),
    tap((movies) => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty')),
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  result$ = combineLatest([this.filter$, this.movies$]).pipe(
    map(([status, movies]) =>
      movies.filter((movie) => {
        if (status) return movie.app.catalog.status === status;
        return movie.app.catalog.status !== 'archived';
      })
    )
  );

  movieCount$ = this.movies$.pipe(
    map((m) => ({
      all: m.filter((m) => m.app.festival.status !== 'archived').length,
      draft: m.filter((m) => m.app.catalog.status === 'draft').length,
      submitted: m.filter((m) => m.app.catalog.status === 'submitted').length,
      accepted: m.filter((m) => m.app.catalog.status === 'accepted').length,
      archived: m.filter((m) => m.app.catalog.status === 'archived').length,
    }))
  );

  constructor(
    private service: MovieService,
    private snackbar: MatSnackBar,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) {}

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
    this.dynTitle.setPageTitle(storeStatus[filter]);
  }

  resetFilter() {
    this.filter.reset('');
    this.dynTitle.useDefault();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  async updateStatus(movie: Movie, status: StoreStatus, message?: string) {
    await this.service.updateStatus(movie.id, status);
    this.snackbar.open(message || `Title ${storeStatus[status]}.`, '', { duration: 4000 });
  }

  parseDirectors(directors: any) {
    if (Array.isArray(directors)) {
      return directors
        .map(person => typeof person === 'string' ? person : displayName(person))
    } else {
      return displayName(directors);
    }
  }

  openDetails(title: string, values: string[] | string) {
    this.dialog.open(CellModalComponent, { data: { title, values }, maxHeight: '80vh',  minWidth: '50vw', maxWidth: '80vw', minHeight: '50vh', autoFocus: false });
  }
}
