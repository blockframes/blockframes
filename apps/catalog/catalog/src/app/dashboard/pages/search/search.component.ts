import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Movie, MovieService } from '@blockframes/movie/movie/+state';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';

interface MovieSearchResult {
  original: string;
  productionYear: number;
  director: string;
  runningTime: string | number;
}
@Component({
  selector: 'catalog-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {

  public movies$ = new BehaviorSubject<MovieSearchResult[]>([]);

  /** Search term that was previously written */
  public searchTerm: string;

  public columns = {
    original: 'Original Title',
    productionYear: 'Production Year',
    director: 'Director',
    runningTime: 'Running Time'
  };
  public initialColumns = Object.keys(this.columns);

  public filter = new FormControl('Titles');

  constructor(private routerQuery: RouterQuery, private movieService: MovieService) { }

  ngOnInit() {
    const { ids, searchTerm } = this.routerQuery.getValue().state.root.queryParams;
    this.searchTerm = searchTerm;
    this.movieService
      .getValue(ids)
      .then(movies => this.movies$.next(this.prepareTableView(movies)));
  }

  /**
   * @description helper function which flattens the movies
   * @param movies array to be transformed for the table
   */
  private prepareTableView(movies: Movie[]): MovieSearchResult[] {
    const moviesResult: MovieSearchResult[] = [];
    for (const movie of movies) {
      const flatDirector = movie.main.directors.map(director =>
        director.firstName.concat(director.lastName)
      ).flat(1);
      moviesResult.push({
        original: movie.main.title.original,
        productionYear: movie.main.productionYear,
        director: flatDirector.join(' '),
        runningTime: movie.main.totalRunTime
      });
    }
    return moviesResult;
  }

  /** Dynamic filter of movies for each tab. */
  applyFilter(filter?: Movie['main']['title']['original']) {
    this.filter.setValue(filter);
  }
}
