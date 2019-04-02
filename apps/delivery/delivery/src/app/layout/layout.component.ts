import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie, MovieQuery } from '@blockframes/movie';
import { Observable } from 'rxjs';

@Component({
  selector: 'delivery-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit {

  public movie$: Observable<Movie>;

  constructor(private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
  }
}
