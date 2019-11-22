import { ChangeDetectionStrategy, OnInit, Component } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { MovieTitleFormComponent } from '@blockframes/movie/movie/components/movie-title-form/movie-title-form.component';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'delivery-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryHomeComponent implements OnInit {
  public movies$: Observable<Movie[]>;

  constructor(private movieQuery: MovieQuery, private dialog: MatDialog) {}

  ngOnInit() {
    this.movies$ = this.movieQuery.selectAll();
  }

  public addNewMovie() {
    this.dialog.open(MovieTitleFormComponent);
  }
}
