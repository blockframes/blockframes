import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery, Movie, MovieService } from '../+state';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'movie-financing-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  movies$: Observable<Movie[]>;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private router: Router,
  ) {}

  // Initiate the Movies in Akita
  ngOnInit() {
    this.service.fetch();
    this.movies$ = this.query.selectAll();
  }

  public delete(id: string) {
    this.service.remove(id);
  }

}
