import { Observable } from 'rxjs';
import { MovieService } from '@blockframes/movie/movie/+state';
import { Movie } from '@blockframes/movie/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogHomeComponent implements OnInit {
  /** Observable to fetch all movies from the store */
  public movies$: Observable<Movie[]>;

  constructor(private query: MovieService) {}

  ngOnInit() {
    // TODO #721: use query
    this.movies$ = this.query.query;
    this.movies$.subscribe(x => console.log(x))
  }
}
