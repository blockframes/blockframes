import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { switchMap, map, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { MovieService, MovieStore, MovieQuery } from '@blockframes/movie/+state';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent implements OnInit, OnDestroy {
  @HostBinding('@scaleIn') private animePage;
  private sub: Subscription;
  // Todo Try to filter movie before sync with the store
  public titles$ = this.query.selectAll({filterBy: movies => movies.main.storeConfig.status === 'accepted' && movies.main.storeConfig.appAccess.festival});

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private store: MovieStore,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.sub = this.parent.org$.pipe(
      map(org => org.movieIds),
      tap(_ => this.store.reset()),
      switchMap(movieIds => this.service.syncManyDocs(movieIds))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
