import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { startWith, map, tap, shareReplay } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Movie } from '@blockframes/shared/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Intercom } from 'ng-intercom';
import { App } from '@blockframes/utils/apps';
import { StoreStatus } from '@blockframes/shared/model/types';
import { APP } from '@blockframes/utils/routes/utils';

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
    tap(movies => this.dynTitle.setPageTitle('My titles', movies.length ? '' : 'Empty')),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  result$ = combineLatest([this.filter$, this.titles$]).pipe(
    map(([status, titles]) => titles.filter(title => (status ? title.app.festival.status === status : titles)))
  );

  titleCount$: Observable<Record<string, number>> = this.titles$.pipe(
    map(m => ({
      all: m.length,
      draft: m.filter(m => m.app.festival.status === 'draft').length,
      accepted: m.filter(m => m.app.festival.status === 'accepted').length,
      archived: m.filter(m => m.app.festival.status === 'archived').length,
    }))
  );

  constructor(
    private service: MovieService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) {}

  /** Navigate to tunnel if status is draft, else go to page */
  public goToTitle(title: Movie) {
    this.router.navigate([title.id], { relativeTo: this.route });
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
}
