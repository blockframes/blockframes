import { MovieQuery, Movie } from '@blockframes/movie/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogHomeComponent implements OnInit {
  public movies$: Observable<Movie[]>;
  constructor(private query: MovieQuery) {}
  ngOnInit() {
    this.movies$ = this.query.selectAll();
    this.movies$.subscribe(x => console.log(x));
  }
}
