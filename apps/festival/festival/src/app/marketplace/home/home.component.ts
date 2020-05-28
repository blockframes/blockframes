// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Blockframes
import { MovieQuery, MovieMain, MovieService, Movie } from '@blockframes/movie/+state';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

interface CarouselSection {
  title: string;
  movieCount$: Observable<number>;
  movies$: Observable<Movie[]>;
}

@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  public sections: CarouselSection[];

  private sub: Subscription;

  constructor(private movieService: MovieService, private movieQuery: MovieQuery) { }

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(50)).subscribe();
    const selectMovies = (status: MovieMain['status']) => {
      return this.movieQuery.selectAll({
        filterBy: movies => movies.main.status === status && movies.main.storeConfig.appAccess.festival
      });
    }
    this.sections = [
      {
        title: 'Feature Films',
        movieCount$: this.movieQuery.selectAll({ filterBy: movie => movie.main.storeConfig?.status === 'accepted' }).pipe(map(movies => movies.length)),
        movies$: this.movieQuery.selectAll({ filterBy: movie => movie.main.storeConfig?.status === 'accepted' })
      },
      {
        title: 'Post-Production Films',
        movieCount$: selectMovies('post-production').pipe(map(movies => movies.length)),
        movies$: selectMovies('post-production')
      },
      {
        title: 'Completed Films',
        movieCount$: selectMovies('finished').pipe(map(movies => movies.length)),
        movies$: selectMovies('finished')
      }
    ];
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
