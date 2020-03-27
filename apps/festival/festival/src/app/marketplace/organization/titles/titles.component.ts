import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { switchMap, map, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { MovieService, MovieStore, MovieQuery } from '@blockframes/movie/+state';

@Component({
  selector: 'festival-marketplace-organization-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlesComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public titles$ = this.query.selectAll();

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private store: MovieStore,
    private parent: ViewComponent
  ) { }

  ngOnInit(): void {
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
