import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, map, tap, shareReplay } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Movie, StoreStatus, storeStatus } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CellModalComponent } from '@blockframes/ui/cell-modal/cell-modal.component';
import { displayName } from '@blockframes/utils/utils';
import { displayPerson } from '@blockframes/utils/pipes';

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
    map(titles => titles.map(title => {
      title.analytics = title.analytics.filter(analytic => analytic.name === 'pageView');
      return title;
    })),
    tap((movies) => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty')),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  result$ = combineLatest([this.filter$, this.titles$]).pipe(
    map(([status, titles]) =>
      titles.filter((title) => {
        if (status) return title.app.festival.status === status;
        return title.app.festival.status !== 'archived';
      })
    )
  );

  titleCount$: Observable<Record<string, number>> = this.titles$.pipe(
    map((m) => ({
      all: m.filter((m) => m.app.festival.status !== 'archived').length,
      draft: m.filter((m) => m.app.festival.status === 'draft').length,
      accepted: m.filter((m) => m.app.festival.status === 'accepted').length,
      archived: m.filter((m) => m.app.festival.status === 'archived').length,
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

  async updateStatus(movie: Movie, status: StoreStatus, message?: string) {
    await this.service.updateStatus(movie.id, status);
    this.snackbar.open(message || `Title ${storeStatus[status]}.`, '', { duration: 4000 });
  }

  openDetails(title: string, values: string[]) {
    this.dialog.open(CellModalComponent, {
      data: { title, values: displayPerson(values) },
      maxHeight: '80vh',
      minWidth: '50vw',
      maxWidth: '80vw',
      minHeight: '50vh',
      autoFocus: false,
    });
  }
}
