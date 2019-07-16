import { Component, OnInit, ChangeDetectionStrategy, } from '@angular/core';
import { MovieQuery, Movie } from '../../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'movie-view',
  templateUrl: './movie-view.component.html',
  styleUrls: ['./movie-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewComponent implements OnInit {

  public movie$: Observable<Movie>;

  constructor(
    private query: MovieQuery,
  ) { }

  ngOnInit() {
    this.movie$ = this.query.selectActive()
  }
}
