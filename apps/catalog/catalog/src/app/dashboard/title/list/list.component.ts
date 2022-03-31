import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { Router, ActivatedRoute } from '@angular/router';
import { Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { storeStatus } from '@blockframes/utils/static-model';
import { Intercom } from 'ng-intercom';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    tap((movies) => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty')),
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  result$ = combineLatest([this.filter$, this.movies$]).pipe(
    map(([status, movies]) =>
      movies.filter((movie) => (status ? movie.app.catalog.status === status : movies))
    )
  );

  movieCount$ = this.movies$.pipe(
    map((m) => ({
      all: m.length,
      draft: m.filter((m) => m.app.catalog.status === 'draft').length,
      submitted: m.filter((m) => m.app.catalog.status === 'submitted').length,
      accepted: m.filter((m) => m.app.catalog.status === 'accepted').length,
      archived: m.filter((m) => m.app.catalog.status === 'archived').length,
    }))
  );

  constructor(
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private dynTitle: DynamicTitleService,
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

  goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  async archive(movie: Movie) {
    await this.service.updateStatus(movie.id, 'archived');
    this.snackbar.open('Title archived.', '', { duration: 4000 });
  }
}
