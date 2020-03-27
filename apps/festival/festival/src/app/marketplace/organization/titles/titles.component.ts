import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';

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
    private parent: ViewComponent
  ) { }

  ngOnInit(): void {
    this.sub = this.parent.org$.pipe(
      map(org => org.movieIds),
      switchMap(movieIds => this.service.syncManyDocs(movieIds))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
