import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map, tap, shareReplay } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { App } from '@blockframes/utils/apps';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { APP } from '@blockframes/utils/routes/utils';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'festival-dashboard-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  filter = new FormControl();
  filter$ = this.filter.valueChanges.pipe(startWith(this.filter.value));

  titles$ = this.service.queryDashboard(this.app).pipe(
    tap((movies) => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty')),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  result$ = combineLatest([this.filter$, this.titles$]).pipe(
    map(([status, titles]) =>
      titles.filter((title) => (status ? title.app.festival.status === status : titles))
    )
  );

  titleCount$: Observable<Record<string, number>> = this.titles$.pipe(
    map((m) => ({
      all: m.length,
      draft: m.filter((m) => m.app.festival.status === 'draft').length,
      accepted: m.filter((m) => m.app.festival.status === 'accepted').length,
      archived: m.filter((m) => m.app.festival.status === 'archived').length,
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

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
  }

  public console(any: any) {
    console.log(any);
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: StoreStatus) {
    this.filter.setValue(filter);
  }

  resetFilter() {
    this.filter.reset();
  }

  edit({ id }: Movie) {
    this.router.navigate([`/c/o/dashboard/tunnel/movie/${id}`]);
  }

  async archive({ id }: Movie) {
    await this.service.update(id, (movie) => ({
      ...movie,
      app: {
        ...movie.app,
        [this.app]: {
          ...movie.app[this.app],
          status: 'archived',
        },
      },
    }));
    this.snackbar.open('Title archived.', '', { duration: 4000 });
  }
}
