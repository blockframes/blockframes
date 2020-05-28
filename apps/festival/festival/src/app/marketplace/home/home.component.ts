// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

// Blockframes
import { MovieQuery, MovieMain, MovieService, Movie } from '@blockframes/movie/+state';

// RxJs
import { Observable, Subscription } from 'rxjs';

interface CarouselSection {
  title: string;
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
    this.sub = this.movieService.syncCollection().subscribe();
    const selectMovies = (status: MovieMain['status']) => {
      return this.movieQuery.selectAll({                                                      // CATALOG ONY FOR DEV
        filterBy: movies => movies.main.status === status && movies.main.storeConfig.appAccess.catalog
      });
    }
    this.sections = [
      {
        title: 'Feature Films',
        movies$: this.movieQuery.selectAll({ filterBy: movie => movie.main.storeConfig?.status === 'accepted' })
      },
      {
        title: 'Post-Production Films',
        movies$: selectMovies('post-production')
      },
      {
        title: 'Completed Films',
        movies$: selectMovies('finished')
      }
    ];
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
