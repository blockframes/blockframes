import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MovieService, MovieQuery, Movie } from '../../+state';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MovieTitleFormComponent } from '../../components/movie-title-form/movie-title-form.component';

@Component({
  selector: 'movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MovieListComponent implements OnInit {

  public movies$: Observable<Movie[]>

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.movies$ = this.query.selectAll();
  }

  public addNewMovie(event: MouseEvent, org: { id: string, name: string}) {
    event.stopPropagation();
    this.dialog.open(MovieTitleFormComponent, { data: org });
  }

  public delete(id: string) {
    this.service.remove(id);
  }
}
