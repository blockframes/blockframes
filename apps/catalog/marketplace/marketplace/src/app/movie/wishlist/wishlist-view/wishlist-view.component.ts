import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';

@Component({
  selector: 'catalog-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistViewComponent implements OnInit {

  public movies$: Observable<Movie[]>;

  constructor(
    private movieQuery: MovieQuery,
  ) {}

  ngOnInit() {
    this.movies$ = this.movieQuery.selectAll();
    this.movies$.subscribe(movies => console.log(movies))
  }
}
